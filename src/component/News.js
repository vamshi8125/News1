import React, { Component } from 'react'
import { FlatList, Image, Platform, RefreshControl, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Axios from "axios";
import { Card, Container, Button, Content, Header, Icon } from "native-base";
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { NavigationContainer } from '@react-navigation/native';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';

class News extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newsData: [],
            loading: false,
            showDatePicker: false,
            selectedDateKey: "startDate",
            startDate: "",
            endDate: "",
            searchNewsData: [],
            showSearchData: false,
            list: [],
            limit: 5,
            offset: 0,
            showEmpty: false,
        }
    }

    UNSAFE_componentWillMount() {
        // alert("clicked");
        NetInfo
            .fetch()
            .then(state => {
                let isConnected = state.isConnected;
                if (!isConnected) {
                    showMessage({
                        message: "Please check your interner connection",
                        type: "danger"
                    });
                    AsyncStorage
                        .getItem("newsData")
                        .then((item) => {
                            console.log('local item is ' + JSON.stringify(item));
                            let newsData = JSON.parse(item)
                            this.setState({
                                newsData: JSON.parse(item),
                                list: this.state.list.concat(newsData.slice(this.state.offset, this.state.limit)),
                                offset: this.state.offset + 5,
                                limit: this.state.limit + 5,
                            })
                        })
                    return true;
                }
                this._fetchNews();
            });

    }

    _fetchNews = () => {
        this.setState({
            loading: true
        });

        Axios.get("https://newsapi.org/v2/everything?q=tesla&from=2021-07-20&sortBy=publishedAt&apiKey=13fac2eeb3f542dba5bda1753a15bc4c")
            .then((res) => {
                //console.warn("fetct news is ", res);
                // alert("called");
                let newsArray = [];
                newsArray = res.data.articles;
                if (newsArray.length <= 0) {
                    this.setState({
                        showEmpty: true
                    })
                }
                this.setState({
                    loading: false,
                    newsData: res.data.articles,
                    list: this.state.list.concat(res.data.articles.slice(this.state.offset, this.state.limit)),
                    offset: this.state.offset + 5,
                    limit: this.state.limit + 5,
                })
                // console.warn("fetch list ", this.state.list);
                AsyncStorage.setItem("newsData", JSON.stringify(newsArray))
                // console.log("res is" + JSON.stringify(res));
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    newsData: []
                })
                //  console.log("error is +++ ", error)
            });

    }


    showDatePicker = (type) => {
        this.setState({
            isDatePickerVisible: true
        })
    };

    hideDatePicker = () => {
        this.setState({
            isDatePickerVisible: false
        })
    };

    _onDatePicked = (mode, stateKey, date) => {
        //console.log("called "+JSON.stringify(date));

        if (mode == 'date') {
            let dD = moment(date).format("YYYY-MM-DD");
            this.setState({
                showDatePicker: false,
                [stateKey]: dD
            });
            return;
        }
        if (date.type == "set") {
            let timestamp = date.nativeEvent.timestamp;
            var h = new Date(timestamp).getHours();
            var m = new Date(timestamp).getMinutes();
            h = (h < 10) ? '0' + h : h;
            m = (m < 10) ? '0' + m : m;
            var output = h + ':' + m;
            this.setState({
                showDatePicker: false
            })
            return;
        }
        this.setState({
            showDatePicker: false
        })
    }

    _openDatePicker = (value = 'startDate') => {
        // console.log("value is", value);
        this.setState({
            selectedDateKey: value,
            showDatePicker: true,
        });
    }

    _closeDatePicker = () => {
        this.setState({
            showDatePicker: false,
        });
    }

    _onSearchPress = () => {
        if (new Date(this.state.startDate).getTime() > new Date(this.state.endDate).getTime()) {
            this.setState({
                loading: false
            });
            showMessage({
                message: "Start date should less than or equal to end date",
                type: 'danger'
            });
            return;
        }
        // console.log("called news Data", this.state.newsData);
        // console.warn("called news Data", this.state.newsData);
        let localNewsData = [];
        let dummmy = this.state.newsData

        localNewsData = dummmy.filter((item) => {
            //  console.log("item iss }} ", item);
            let newsDate = moment(item.publishedAt).format("YYYY-MM-DD");
            //  moment(newsDate).format("YYYY-MM-DD");
            if (newsDate >= this.state.startDate && newsDate <= this.state.endDate) {
                return item;

            }
        })
        if (localNewsData.length <= 0) {
            this.setState({
                showEmpty: true
            })

        }
        this.setState({
            searchNewsData: localNewsData,
            showSearchData: true
        })
        // console.log("search news data is ", JSON.stringify(localNewsData))

    }

    _onCancelPress = () => {
        this.setState({
            showSearchData: false,
            startDate: "",
            endDate: ""
        })
    }

    fetchLoadmore = () => {
        this.setState({
            loading: true
        })
        let res = this.state.newsData;
        setTimeout(() => {
            this.setState({
                list: this.state.list.concat(res.slice(this.state.offset, this.state.limit)),
                offset: this.state.offset + 5,
                limit: this.state.limit + 5,
                loading: false
            });
        }, 1500)

    }
    render() {
        return (
            <Container>
                <FlashMessage
                    position={
                        Platform.OS === 'ios'
                            ? "top"
                            : { top: StatusBar.currentHeight, left: 0, right: 0 }
                    }
                    floating={Platform.OS !== 'ios'}
                    autoHide={true}
                    duration={3000}
                />
                <Spinner
                    visible={this.state.loading}
                    textContent={"Loading"}
                    textStyle={{ color: "black" }}
                />
                {/* <Content
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flex: 1 }}
                > */}
                <View
                    style={{
                        //flex: 1,
                        flexDirection: 'row',
                        marginTop: 20,
                        alignItems: 'center',
                        marginHorizontal: 20,
                    }}>
                    <Button
                        transparent
                        bordered
                        full
                        style={{
                            flex: 1,
                            backgroundColor: "white",
                            borderRadius: 10,
                            borderColor: "black",
                            marginRight: 15,
                            paddingRight: 15,
                            paddingVertical: 10,
                        }}
                        onPress={() => this._openDatePicker('startDate')}>
                        <AntIcon name="calendar" type="AntDesign" style={{ color: "black", fontSize: 20 }} />
                        <Text style={{
                            alignSelf: 'center',
                            //marginRight: 35,
                            //fontFamily: (Platform.OS == 'ios') ? CONSTANTS.FONT_FAMILIES.PingFangSCMedium : CONSTANTS.FONT_FAMILIES.SFProDisplaySemibold,
                            fontSize: 15,
                            color: "black"
                        }}>
                            {
                                (this.state.startDate == "")
                                    ? "Start Date"
                                    : this.state.startDate
                            }
                        </Text>
                    </Button>
                    <Button
                        transparent
                        bordered
                        full
                        style={{
                            flex: 1,
                            backgroundColor: "white",
                            borderRadius: 10,
                            borderColor: "black",
                            marginLeft: 15,
                            paddingRight: 15,
                            paddingVertical: 10,
                        }}
                        onPress={() => this._openDatePicker('endDate')}>
                        <AntIcon name="calendar" style={{ color: "black", fontSize: 20, }} />
                        <Text style={{
                            alignSelf: 'center',
                            //marginRight: 35,
                            //fontFamily: (Platform.OS == 'ios') ? CONSTANTS.FONT_FAMILIES.PingFangSCMedium : CONSTANTS.FONT_FAMILIES.SFProDisplaySemibold,
                            fontSize: 15,
                            color: "black"
                        }}>
                            {
                                (this.state.endDate == "")
                                    ? "End Date"
                                    : this.state.endDate
                            }
                        </Text>
                    </Button>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginVertical: 10
                    }}
                >
                    <TouchableOpacity style={{ marginHorizontal: 20, width: 100, backgroundColor: "green", alignItems: "center", borderRadius: 10 }} onPress={this._onSearchPress} ><Text style={{ padding: 5, color: "white", fontSize: 20 }}>{"Search"}</Text></TouchableOpacity>
                    <TouchableOpacity style={{ marginHorizontal: 20, width: 100, backgroundColor: "red", alignItems: "center", borderRadius: 10 }} onPress={this._onCancelPress} ><Text style={{ padding: 5, color: "white", fontSize: 20 }}>{"Cancel"}</Text></TouchableOpacity>
                </View>

                <DateTimePicker
                    isVisible={this.state.showDatePicker}
                    onCancel={this._closeDatePicker}
                    onConfirm={(date) => this._onDatePicked("date", this.state.selectedDateKey, date)}
                    mode='date'
                    stateKey={this.state.selectedDateKey}
                    dismissOnBackdropPressIOS={true}
                />
                <Content
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flex: 1 }}
                >
                    <FlatList
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        extraData={this.state}
                        onEndReached={this.fetchLoadmore}
                        onEndReachedThreshold={0.1}
                        data={(!this.state.showSearchData) ? this.state.list : this.state.searchNewsData}

                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                            //  console.log("item is "+ JSON.stringify(item));
                            return (
                                <Card
                                    style={styles.cardStyle}
                                >
                                    <TouchableOpacity
                                        onPress={() => this.props.navigation.navigate("NewsDetails", { data: item })}
                                    >
                                        <FastImage
                                            style={{ width: "100%", height: 200 }}
                                            source={{
                                                uri: item.urlToImage,
                                            }}
                                            resizeMode={FastImage.resizeMode.contain}
                                        />
                                    </TouchableOpacity>

                                    <Text style={{ paddingVertical: 5, paddingHorizontal: 20 }} numberOfLines={2}>{(item.title != "" || item.title != null) ? item.title : null}</Text>
                                    <Text style={styles.dateStyle}>{moment(item.publishedAt).format("YYYY-MM-DD hh:mm A")}</Text>
                                </Card>

                            )
                        }}

                        ListEmptyComponent={() => {
                            if (this.state.showEmpty) {
                                return (
                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: "10%" }}>
                                        <Text style={{ fontSize: 25, }}>
                                            {"No Data Found"}
                                        </Text>
                                    </View>
                                )
                            }
                            return null;
                        }}

                    />

                </Content>
            </Container>
        )
    }
}

const styles = {
    cardStyle: {
        width: "100%",
        paddingRight: 15,
        marginLeft: 5,
        shadowColor: '#30C1DD',
        shadowRadius: 1,
        shadowOpacity: 0.1,
        elevation: 8,

        shadowOffset: {
            width: 0,
            height: 0
        }
    },
    dateStyle: {
        textAlign: "right",
        paddingRight: 11,
        paddingVertical: 5,
        color: "red"
    }
}

export default News;
