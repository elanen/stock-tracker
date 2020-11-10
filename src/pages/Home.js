import React, { useState } from 'react';
import { Label, Select } from '@rebass/forms'
import { Box, Button, Flex, Heading } from 'rebass';
import { symbols } from '../data/symbols';
import { retrieveOpeningData } from '../functions/httpRequests';

const Home = (props) => {
    
    const [symbol, setSymbol] = useState(symbols[0]);

    const handleChange = (e) => {
        setSymbol(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        retrieveOpeningData(symbol.trigger, props.setData, props.setIsLoading);
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
                            value={symbol}
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
                            Submit
                        </Button>
                    </Box>
                </Flex>
                {props.isLoading ? (
                    <></>
                ):(
                    <Flex flexDirection="column">
                        {props.data && props.data.map((obj, i) => (
                            <div key={i}>
                                <div>{`X: ${obj.x}`}</div>
                                <div>{`Y: ${obj.y}`}</div>
                            </div>
                        ))}
                    </Flex>
                )}
            </Flex>
        </div>
    );
};

export default Home;
