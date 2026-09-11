Imprint — Chrome / Edge extension
=================================

You have two packages:

  imprint-extension.zip   Load unpacked (recommended)
  imprint-extension.crx   Packed CRX3 (same files, signed)

ZIP — Load unpacked (Chrome and Edge)
-------------------------------------
1. Unzip. You should see a folder named “imprint” that contains manifest.json.
2. Open chrome://extensions or edge://extensions.
3. Turn on Developer mode.
4. Click “Load unpacked” and select that imprint folder.
5. Pin Imprint, open any form, press Scan then Fill.

CRX — packed file
-----------------
This is a signed Manifest V3 package. Chrome no longer installs a random
.crx by double-click (Web Store only). Use it to:
  • archive a frozen build
  • upload to a private enterprise store
  • drag onto edge://extensions on some Edge builds with Developer mode on

If the CRX is blocked, unzip the ZIP and Load unpacked instead.

Custom fields you have never stored will prompt once. Check “Save to vault”
and Imprint will reuse the answer on the next site.

Passwords, card numbers, and legal checkboxes are never filled.
