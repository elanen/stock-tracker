import firebase from '../firebase';
const functions = firebase.functions();

export const retrieveOpeningData = async (symbol, setData, setIsLoading) => {
    let array = [];
    const getData = functions.httpsCallable('retrieveOpeningData');
    await setIsLoading(true);
    await getData({ symbol: symbol }).then(res => {
        array = res.data.data;          
    });
    console.log('Array: ', array);
    await setData(array);
    return setIsLoading(false);
};
