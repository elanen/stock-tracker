import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Home from './pages/Home';
import { ThemeProvider } from 'emotion-theming'
import theme from '@rebass/preset'
import './App.css';
import { retrieveOpeningData } from './functions/httpRequests';

const App = () => {
    
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        retrieveOpeningData('tsla', setData, setIsLoading);
    }, []);
    
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route 
                        exact
                        path="/"
                        render={() => <Home 
                            data={data} 
                            setData={setData}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        />}
                    />
                </Switch>
            </Router>
        </ThemeProvider>
    );
};

export default App;
