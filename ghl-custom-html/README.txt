GHL Custom HTML Export

How to use:
1) Create pages in GHL with these slugs:
   / (home), /classes, /class-detail, /about, /contact, /faq,
   /booking, /confirmation, /free-trial, /manage-booking
2) For each page, add a Custom HTML element and paste the matching file content.
3) If you split content into multiple blocks on a page, keep the <style> only once.
4) The logo is embedded as a data URI. Replace it if you want a different logo.

Notes about CSS in GHL:
- Best practice is to keep CSS in one place per page (a single Custom HTML block).
- If you want truly global CSS, put the <style> block in the page header or a reusable section.
