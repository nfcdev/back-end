// const p1 = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('test1')
//     }, 3000)
// });


const p6 = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('hej1');

        resolve()
    }, 3000)
});

const p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('fel')
        console.log('bajsa');
        resolve('test1')
    }, 2000)
});

// console.log('hej2');


// Promise.all([p1, p2]).then((answer) => {
//     console.log(answer);
// }).catch(e => {
//     console.log(e);
// })

const test2 = {
    body: {
        vapen: ['asd', 'asd']
    }
}


const test = async () => {
    try {
        await p6;
        await p2;
    } catch (error) {
        console.log(error);
    }

}

const getdatabasedata = () => {
    setTimeout(() => {
        return 5;
    }, 2000)
}


const svar = getdatabasedata();

console.log(svar);

module.exports = {
    test,
}