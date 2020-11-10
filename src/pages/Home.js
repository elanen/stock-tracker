import React, { useState } from 'react';
import { Label, Select } from '@rebass/forms'
import { Box, Button, Flex, Heading } from 'rebass';
import { Line } from 'react-chartjs-2';
import { symbols } from '../data/symbols';
import { retrieveOpeningData } from '../functions/httpRequests';

const Home = (props) => {
    
    const [symbol, setSymbol] = useState(symbols[0]);

    const handleChange = (e) => {
        const finalObj = symbols.filter(s => s.symbol === e.target.value);
        setSymbol(finalObj[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        retrieveOpeningData(symbol, props.setData, props.setIsLoading);
    };

    return (
        <div className="page">
            <Flex flexDirection="column" width={0.9} m="0 auto" pt={48}>
                <Heading
                    fontSize={[5,6,7]}
                    color="black"
                    mb={24}
                >
                    Stock Tracker
                </Heading>
                <Flex as="form" onSubmit={handleSubmit} alignItems="flex-end" width="100%">
                    <Box>
                        <Label mb={1} fontWeight="bold" htmlFor="symbol">Symbol</Label>
                        <Select 
                            id="symbol" 
                            name="symbol" 
                            value={symbol.symbol}
                            onChange={handleChange}
                            minWidth={120}
                            sx={{ border: '2px solid black' }}
                        >
                            {symbols && symbols.map(obj => (
                                <option key={obj.key}>
                                    {obj.symbol}
                                </option>
                            ))}
                        </Select>
                    </Box>
                    <Box>
                        <Button
                            type="submit"
                            variant="primary"
                            ml={12}
                            sx={{ cursor: 'pointer', height: 37 }}
                        >
                            Update
                        </Button>
                    </Box>
                </Flex>
                {props.isLoading ? (
                    <></>
                ):(
                    <Flex mt={36} flexDirection="column">                        
                        <Line 
                            data={props.data}
                            options={{  }}
                        />
                    </Flex>
                )}
            </Flex>
        </div>
    );
};

export default Home;
