export const getRNG = () => {
    const rand = parseInt(Math.random() * 100000000 + 100000000)

    return rand.toString().substring(rand.toString().length - 8, 8);
}
