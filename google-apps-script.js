/**
 * ============================================
 * TAKE OVER - GOOGLE APPS SCRIPT
 * ============================================
 * 
 * COME USARE:
 * 1. Crea un nuovo Google Sheet
 * 2. Vai su Estensioni > Apps Script
 * 3. Incolla TUTTO questo codice
 * 4. Salva (Ctrl+S) e dai un nome al progetto
 * 5. Esegui "creaFogliTemplate" per creare la struttura
 * 6. Implementa come Web App (Implementa > Nuova implementazione > App web > Chiunque)
 * 7. Copia l'URL e incollalo in script.js
 */

// ============================================
// CONFIGURAZIONE
// ============================================
const DRIVE_ROOT_FOLDER_ID = '1U0Uyb-hgbXvRBhBoFIeJvy12vprhJ6xW'; // Cambia con il tuo ID

// ============================================
// WEB APP ENDPOINT
// ============================================

function doGet(e) {
    try {
        // Check if requesting photos for a specific event
        const action = e?.parameter?.action;
        const eventName = e?.parameter?.event;
        const eventDate = e?.parameter?.date;

        if (action === 'photos' && eventName) {
            const photos = getEventPhotos(eventName, eventDate);
            return ContentService
                .createTextOutput(JSON.stringify({ photos: photos }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Default: return all site content
        const data = getAllContent();
        return ContentService
            .createTextOutput(JSON.stringify(data))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ error: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// DATA FETCHING
// ============================================

function getAllContent() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    return {
        config: getConfigContent(ss),
        serate: getSerateContent(ss),
        lastUpdated: new Date().toISOString()
    };
}

function getConfigContent(ss) {
    const sheet = ss.getSheetByName('Config');
    if (!sheet) return {};

    const data = sheet.getDataRange().getValues();
    const result = {};

    for (let i = 1; i < data.length; i++) {
        const key = data[i][0];
        const value = data[i][1];
        if (key) result[key] = value;
    }

    return result;
}

function getSerateContent(ss) {
    const sheet = ss.getSheetByName('Serate');
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().toLowerCase().replace(/\s+/g, '_'));
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0]) {
            const obj = { id: 'e' + i };
            headers.forEach((header, j) => {
                obj[header] = row[j] || '';
            });
            result.push(obj);
        }
    }

    return result;
}

// ============================================
// GOOGLE DRIVE PHOTO FETCHING
// ============================================

/**
 * Trova e restituisce le foto di un evento
 * Cerca cartelle su Drive con nome corrispondente
 */
function getEventPhotos(eventName, eventDate) {
    try {
        // Cerca la cartella dell'evento
        const folderId = findEventFolder(eventName, eventDate);

        if (!folderId) {
            return [];
        }

        // Ottieni le immagini dalla cartella
        return getImagesFromFolder(folderId);

    } catch (error) {
        console.error('getEventPhotos error:', error);
        return [];
    }
}

/**
 * Cerca una cartella su Drive corrispondente all'evento
 */
function findEventFolder(eventName, eventDate) {
    if (!eventName) return null;

    const rootFolder = DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);
    if (!rootFolder) return null;

    // Pattern di ricerca: NOME_DATA, NOME DATA, NOME
    const dateFormatted = eventDate ? eventDate.toString().replace(/\./g, '_').replace(/\//g, '_') : '';

    const searchPatterns = [];
    if (eventName && dateFormatted) {
        searchPatterns.push(eventName + '_' + dateFormatted);
        searchPatterns.push(eventName + ' ' + dateFormatted);
    }
    searchPatterns.push(eventName);

    // Cerca tra le sottocartelle
    const subFolders = rootFolder.getFolders();

    while (subFolders.hasNext()) {
        const folder = subFolders.next();
        const folderName = folder.getName().toUpperCase();

        for (const pattern of searchPatterns) {
            if (folderName.includes(pattern.toUpperCase())) {
                console.log('Found folder: ' + folder.getName());
                return folder.getId();
            }
        }
    }

    // Fallback: usa la cartella root
    console.log('Using root folder as fallback');
    return DRIVE_ROOT_FOLDER_ID;
}

/**
 * Ottieni tutte le immagini da una cartella Drive
 */
function getImagesFromFolder(folderId) {
    const photos = [];

    try {
        const folder = DriveApp.getFolderById(folderId);
        const files = folder.getFiles();

        while (files.hasNext()) {
            const file = files.next();
            const mimeType = file.getMimeType();

            // Solo immagini
            if (mimeType.startsWith('image/')) {
                const fileId = file.getId();

                // Costruisci URL pubblico per l'immagine
                // Metodo 1: Thumbnail link (funziona sempre)
                const thumbnailUrl = 'https://lh3.googleusercontent.com/d/' + fileId + '=s1600';

                photos.push({
                    id: fileId,
                    name: file.getName(),
                    url: thumbnailUrl
                });
            }
        }

        console.log('Found ' + photos.length + ' images');

    } catch (error) {
        console.error('getImagesFromFolder error:', error);
    }

    return photos;
}

// ============================================
// TEMPLATE CREATION
// ============================================

function creaFogliTemplate() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // ========== CONFIG SHEET ==========
    let configSheet = ss.getSheetByName('Config');
    if (!configSheet) configSheet = ss.insertSheet('Config');
    configSheet.clear();

    configSheet.getRange('A1:B1').setValues([['Chiave', 'Valore']]).setFontWeight('bold');
    configSheet.getRange('A2:B20').setValues([
        ['site_title', 'TAKE OVER'],
        ['hero_title', 'TAKE OVER'],
        ['hero_subtitle', 'PREMIUM UNDERGROUND INFRASTRUCTURE'],
        ['hero_image', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070'],
        ['hero_button_text', 'SECURE ACCESS'],
        ['archive_title', 'ARCHIVE'],
        ['archive_subtitle', 'VISUAL EVIDENCE // SELECT A NIGHT'],
        ['schedule_title', 'SCHEDULE'],
        ['schedule_subtitle', 'UPCOMING TRANSMISSIONS'],
        ['footer_cta', 'JOIN THE VOID.'],
        ['footer_copyright', '© 2024 TAKE OVER ENTERTAINMENT // PROTOCOL ZERO'],
        ['back_button_text', 'BACK'],
        ['loading_text', 'SYNCING_DATA...'],
        ['error_title', 'UPLINK ERROR'],
        ['instagram_url', 'https://instagram.com/takeover'],
        ['twitter_url', 'https://twitter.com/takeover'],
        ['spotify_url', 'https://open.spotify.com'],
        ['', ''],
        ['// ISTRUZIONI:', 'Modifica i valori nella colonna B per cambiare i testi del sito']
    ]);
    configSheet.autoResizeColumns(1, 2);
    configSheet.setColumnWidth(2, 400);

    // Style
    configSheet.getRange('A19:B19').setFontColor('#999999').setFontStyle('italic');

    // ========== SERATE SHEET ==========
    let serateSheet = ss.getSheetByName('Serate');
    if (!serateSheet) serateSheet = ss.insertSheet('Serate');
    serateSheet.clear();

    serateSheet.getRange('A1:G1').setValues([[
        'data', 'nome', 'venue', 'stato', 'descrizione', 'cover_image', 'cartella_foto'
    ]]).setFontWeight('bold');

    serateSheet.getRange('A2:G5').setValues([
        ['31.10', 'CARNAGE', 'HELL CLUB', 'SOLD OUT', 'Initial disruption protocol.', 'https://images.unsplash.com/photo-1514525253344-425b03c73f1a?q=80&w=800', ''],
        ['12.11', 'VOID', 'WAREHOUSE X', 'ACTIVE', 'Industrial heavy bass immersion.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800', ''],
        ['01.12', 'GENESIS', 'PLAZA_0', 'SOON', 'The next phase of takeover.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800', ''],
        ['20.12', 'ABYSS', 'BUNKER 7', 'SOON', 'Descend into darkness.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800', '']
    ]);

    serateSheet.autoResizeColumns(1, 7);
    serateSheet.setColumnWidth(5, 300);
    serateSheet.setColumnWidth(6, 400);
    serateSheet.setColumnWidth(7, 200);

    // Add notes
    serateSheet.getRange('G1').setNote('Lascia vuoto per cercare automaticamente una cartella su Drive con il nome della serata.\nOppure inserisci:\n- Un folder ID di Google Drive\n- Un URL completo della cartella');
    serateSheet.getRange('D1').setNote('Valori possibili:\n- SOLD OUT\n- ACTIVE\n- SOON');

    // ========== ISTRUZIONI SHEET ==========
    let istruzioniSheet = ss.getSheetByName('Istruzioni');
    if (!istruzioniSheet) istruzioniSheet = ss.insertSheet('Istruzioni');
    istruzioniSheet.clear();

    istruzioniSheet.getRange('A1').setValue('📖 GUIDA TAKE OVER CMS').setFontSize(18).setFontWeight('bold');
    istruzioniSheet.getRange('A3:A20').setValues([
        ['🔧 CONFIGURAZIONE'],
        [''],
        ['1. Modifica i testi nel foglio "Config"'],
        ['2. Aggiungi/modifica le serate nel foglio "Serate"'],
        ['3. Per aggiungere foto di una serata:'],
        ['   a) Crea una cartella su Google Drive'],
        ['   b) Nomina la cartella: NOME_SERATA_DATA (es: CARNAGE_31_10)'],
        ['   c) Carica le foto nella cartella'],
        ['   d) Il sito le troverà automaticamente!'],
        [''],
        ['📸 FOTO AUTOMATICHE'],
        [''],
        ['Il sistema cerca cartelle su Drive con questo ordine:'],
        ['   1) NOME_DATA (es: CARNAGE_31_10)'],
        ['   2) NOME (es: CARNAGE)'],
        ['   3) Cartella root (fallback)'],
        [''],
        ['🚀 PUBBLICAZIONE'],
    ]);

    istruzioniSheet.setColumnWidth(1, 500);
    istruzioniSheet.getRange('A1').setFontColor('#ff0000');
    istruzioniSheet.getRange('A3').setFontWeight('bold');
    istruzioniSheet.getRange('A11').setFontWeight('bold');
    istruzioniSheet.getRange('A18').setFontWeight('bold');

    // Delete default sheet
    const defaultSheet = ss.getSheetByName('Foglio1');
    if (defaultSheet && ss.getSheets().length > 1) {
        ss.deleteSheet(defaultSheet);
    }

    SpreadsheetApp.getUi().alert(
        '✅ Template creato!\n\n' +
        'Fogli creati:\n' +
        '• Config - Testi del sito\n' +
        '• Serate - Lista eventi\n' +
        '• Istruzioni - Guida all\'uso\n\n' +
        'Ora vai su Implementa > Nuova implementazione per pubblicare.'
    );
}

// ============================================
// CUSTOM MENU
// ============================================

function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('🎵 Take Over')
        .addItem('📋 Crea Template', 'creaFogliTemplate')
        .addItem('👁️ Anteprima JSON', 'mostraAnteprima')
        .addItem('🚀 Guida Pubblicazione', 'mostraGuida')
        .addToUi();
}

function mostraAnteprima() {
    const data = getAllContent();
    const json = JSON.stringify(data, null, 2);

    const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Inter, Arial, sans-serif; padding: 20px; background: #111; color: #fff; }
      pre { background: #222; padding: 15px; border-radius: 8px; overflow: auto; max-height: 400px; font-size: 12px; }
      h3 { color: #ff0000; }
    </style>
    <h3>📡 Anteprima Dati JSON</h3>
    <p style="color: #666;">Questi dati verranno inviati al sito:</p>
    <pre>${json}</pre>
  `).setWidth(600).setHeight(500);

    SpreadsheetApp.getUi().showModalDialog(html, 'Anteprima JSON');
}

function mostraGuida() {
    const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Inter, Arial, sans-serif; padding: 20px; background: #111; color: #fff; line-height: 1.6; }
      h3 { color: #ff0000; margin-top: 0; }
      ol { padding-left: 20px; }
      li { margin-bottom: 12px; }
      code { background: #333; padding: 3px 8px; border-radius: 4px; font-size: 13px; }
      .success { color: #00ff00; font-weight: bold; }
    </style>
    <h3>🚀 Come Pubblicare</h3>
    <ol>
      <li>Clicca su <strong>Implementa</strong> > <strong>Nuova implementazione</strong></li>
      <li>Clicca sull'icona ⚙️ e seleziona <strong>App web</strong></li>
      <li>Imposta "Chi ha accesso" su: <strong>Chiunque</strong></li>
      <li>Clicca <strong>Implementa</strong></li>
      <li>Copia l'<strong>URL</strong> generato</li>
      <li>Apri <code>script.js</code> del sito</li>
      <li>Incolla l'URL in <code>GOOGLE_SHEETS_API_URL</code></li>
      <li>Cambia <code>USE_FALLBACK</code> in <code>false</code></li>
    </ol>
    <p class="success">✅ Fatto! Ogni modifica al foglio aggiornerà il sito!</p>
  `).setWidth(500).setHeight(450);

    SpreadsheetApp.getUi().showModalDialog(html, 'Guida Pubblicazione');
}
