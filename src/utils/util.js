export const getRNG = (key) => {
    const rand = key * 1549419787

    return rand.toString().substring(rand.toString().length - 8, 8);
}
