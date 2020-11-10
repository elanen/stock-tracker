import firebase from '../firebase';
const functions = firebase.functions();

export const retrieveOpeningData = async (symbol, setData, setIsLoading) => {
    let array = [];
    const getData = functions.httpsCallable('retrieveOpeningData');
    await setIsLoading(true);
    await getData({ symbol: symbol.trigger }).then(res => {
        array = res.data.data;          
    });
    const filteredData = array[0];
    await setData({ 
        labels: ['% Change', 'Date'], 
        datasets: [
            {
                label: symbol.symbol,
                data: filteredData
            }
        ]
    });
    return setIsLoading(false);
};
