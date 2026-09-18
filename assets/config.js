/* ============================================================
   DarwinApps — site configuration

   This is the only file you need to edit to change the contact
   details. Nothing here gets compiled or built.
   ============================================================ */

window.DARWIN_CONFIG = {

  /* Email address, e.g. "hello@darwinapps.pl".
     Used in the contact section, the footer and the form's fallback
     messages. Leave it empty and those places show "—" instead. */
  email: "",

  phone: "+48 570 915 038",

  /* The site is static, so the form needs an external service to
     deliver messages. It is set up for Web3Forms (free, no account):

       1. Go to https://web3forms.com
       2. Enter the address that should receive the messages
       3. Paste the key you get by email below

     While the key is empty the form runs in demo mode: it validates
     the fields and says plainly that sending is not connected yet.
     It never pretends to succeed.

     For Formspree instead, set formEndpoint to
     "https://formspree.io/f/YOUR_ID" and leave accessKey empty. */
  formEndpoint: "https://api.web3forms.com/submit",
  accessKey: "",

  address: {
    line1: "Pl. Gen. J. Hallera 5 lok. 14A",
    line2: "03-464 Warszawa",
    country: "Poland"
  }
};
