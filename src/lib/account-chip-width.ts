// Shared by the client header (which records the width) and the root layout (which
// applies it before paint). Kept out of the "use client" module so the server layout
// imports a plain string rather than a client reference.
export const ACCOUNT_CHIP_WIDTH_KEY = "account-chip-width";

/** Runs in <head> before paint: sizes the pending chip to the last settled one. */
export const accountChipWidthScript = `try{var w=localStorage.getItem("${ACCOUNT_CHIP_WIDTH_KEY}");if(w)document.documentElement.style.setProperty("--account-chip-width",w+"px")}catch(e){}`;
