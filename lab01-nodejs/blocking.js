console.log("Start");

const start = Date.now();

setTimeout(() => {
    console.log(
        "Timer executed after:",
        Date.now() - start,
        "ms"
    );
}, 0);

// Blocking operation
let total = 0;

for (let i = 0; i < 3_000_000_000; i++) {
    total += i;
}

console.log("Blocking loop finished");

console.log(
    "Blocking elapsed time:",
    Date.now() - start,
    "ms"
);