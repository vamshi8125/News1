import { Card } from 'native-base';
import React, { Component } from 'react'
import { Linking, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image';

class NewsDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //  data:this.props.navigation.getParam("data", null)
        }
    }
    render() {
        const { data } = this.props.route.params
        return (
            <Card
                style={{
                    //  width:"80%",
                    marginLeft: 5,
                    marginRight: 5,
                    borderRadius: 10,
                    marginVertical: 10
                }}
            >
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        padding:15,
                        textAlign:"justify"
                    }}
                > {(data.title != "") ? data.title : null} </Text>
                <FastImage
                    style={{ width: "100%", height: 200 }}
                    source={{
                        uri: (data.urlToImage != "") ? data.urlToImage : null,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                />
                <Text
                    style={{
                        fontSize: 14,
                        padding:10,
                        textAlign:"justify"
                       // fontWeight: "bold"
                    }}
                >
                    {(data.content != "") ? data.content : ""}
                </Text>

                <Text
                    style={{
                        color: "skyblue",
                        textDecorationLine: "underline",
                        padding: 10
                    }}
                    onPress={() => Linking.openURL(data.url)}
                >
                    {data.url}
                </Text>
            </Card>
        )
    }
}

export default NewsDetails;
