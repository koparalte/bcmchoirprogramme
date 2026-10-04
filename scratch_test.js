async function test() {
   const url = "https://docs.google.com/spreadsheets/d/1rDQk-t0aKI1OqsiYHUYg6i-KJXhF2QdlnPnjViBvkgU/edit?usp=sharing";
   const res = await fetch(`https://docs.google.com/spreadsheets/d/1rDQk-t0aKI1OqsiYHUYg6i-KJXhF2QdlnPnjViBvkgU/gviz/tq?tqx=out:json&headers=1`);
   const text = await res.text();
   console.log("Response text start:", text.substring(0, 1000));
}
test();
