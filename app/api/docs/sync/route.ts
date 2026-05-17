import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const DOC_TITLE = 'Language Learning Log';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const docs = google.docs({ version: 'v1', auth: oauth2Client });

  try {
    const { action, date, payload } = await req.json();

    // 1. Find or create the Document
    let docId = '';
    const searchRes = await drive.files.list({
      q: `name='${DOC_TITLE}' and mimeType='application/vnd.google-apps.document' and trashed=false`,
      fields: 'files(id)',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      docId = searchRes.data.files[0].id!;
    } else {
      const createRes = await docs.documents.create({
        requestBody: { title: DOC_TITLE },
      });
      docId = createRes.data.documentId!;
    }

    // 2. Fetch Document to check tabs
    // Note: get with includeTabsContent=true
    const docRes = await docs.documents.get({
      documentId: docId,
      includeTabsContent: true,
    });

    const doc = docRes.data;
    const tabs = doc.tabs || [];
    let currentTabId = '';
    let currentTabIndex = 0;

    const existingTab = tabs.find((t: any) => t.tabProperties?.title === date);
    if (existingTab) {
      currentTabId = existingTab.tabProperties?.tabId!;
      currentTabIndex = existingTab.tabProperties?.index!;
    } else {
      // 3. Create a new tab
      const addTabRes = await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              addDocumentTab: {
                tabProperties: { title: date }
              }
            }
          ]
        }
      });
      
      const resTabId = addTabRes.data.replies?.[0]?.addDocumentTab?.tabProperties?.tabId;
      if (resTabId) {
         currentTabId = resTabId;
      } else {
         // Fallback if not returned
         const docRes2 = await docs.documents.get({ documentId: docId, includeTabsContent: true });
         const newTab = docRes2.data.tabs?.find((t: any) => t.tabProperties?.title === date);
         currentTabId = newTab?.tabProperties?.tabId || '';
      }
    }

    // 4. Determine end of tab to insert
    // We need to fetch the tab contents to find the end index.
    const freshDoc = await docs.documents.get({
      documentId: docId,
      includeTabsContent: true,
    });
    
    let endIndex = 1; // Default
    if (freshDoc.data.tabs) {
      const tab = freshDoc.data.tabs.find((t: any) => t.tabProperties?.tabId === currentTabId);
       if (tab && tab.documentTab && tab.documentTab.body && tab.documentTab.body.content) {
          const content = tab.documentTab.body.content;
          endIndex = content[content.length - 1].endIndex! - 1; 
       }
    }

    // 5. Append data based on action
    let textToInsert = '';
    let offset = endIndex || 1;

    if (action === 'logSessionText') {
        const timestamp = new Date().toISOString().split('T')[1].slice(0,5);
        textToInsert = `[${timestamp}] ${payload.title}\nDetails: ${payload.details}\nDuration: ${payload.duration}m\n\n`;
    }

    if (textToInsert) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  tabId: currentTabId,
                  index: offset
                },
                text: textToInsert
              }
            }
          ]
        }
      });
    }

    return NextResponse.json({ success: true, docId });
  } catch (error: any) {
    console.error('Docs sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
