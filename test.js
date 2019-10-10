const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('test1')
    }, 3000)
});

const p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('hej1');
        resolve('test1')
    }, 2000)
});

console.log('hej2');

Promise.all([p1, p2]).then((answer) => {
    console.log(answer);
}).catch(e => {
    console.log(e);
})

const test = {
    body: {
        vapen: ['asd', 'asd']
    }
}

module.exports = {
    test,
}