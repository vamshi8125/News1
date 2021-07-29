//import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import News from "../src/component/News";
import NewsDetails from "../src/component/NewsDetails";
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage'
import Feather from 'react-native-vector-icons/Feather'
import AntIcon from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FlashMessage from 'react-native-flash-message';


Icon.loadFont();
Feather.loadFont();
AntIcon.loadFont();
Fontisto.loadFont();

const MainStack = createStackNavigator();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <NavigationContainer>
                <MainStack.Navigator>
                    <MainStack.Screen name="News" component={News} />
                    <MainStack.Screen name="NewsDetails" component={NewsDetails} />
                 </MainStack.Navigator>
            </NavigationContainer>

        )
    }
}

export default App;
