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
            offset: 1,
            showEmpty: false,
            searchOffset: 1
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
                            if(item.length <= 0) {
                                this.setState({
                                    showEmpty:true
                                })
                            }
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

        Axios.get("https://newsapi.org/v2/everything?q=apple&pageSize=20&page=" + this.state.offset + "&sortBy=publishedAt&apiKey=aa2ed565090b43a5a40b236e76f4cd88")
            .then((res) => {
                console.log("fetct news is ", res);
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
                    newsData: this.state.newsData.concat(res.data.articles),
                })
                // console.warn("fetch list ", this.state.list);
                AsyncStorage.setItem("newsData", JSON.stringify(this.state.newsData))
                // console.log("res is" + JSON.stringify(res));
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    // newsData: []
                })
                console.log("error is +++ ", error)
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
        console.log("Search")
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
                        .getItem("searchData")
                        .then((item) => {
                            console.log('on search item is ' + JSON.parse(item));
                            let searchNewsData = JSON.parse(item)
                            this.setState({
                                showSearchData: false,
                                searchNewsData: searchNewsData,
                            })
                            if (this.state.startDate == "" && this.state.endDate == "") {
                                showMessage({
                                    message: "Please select start date and end date",
                                    type: "danger"
                                })
                                return;
                            }
                            if (this.state.startDate == "") {
                                showMessage({
                                    message: "Please select start date",
                                    type: "danger"
                                })
                                return;
                            }
                            if (this.state.endDate == "") {
                                showMessage({
                                    message: "Please select end date",
                                    type: "danger"
                                })
                                return;
                            }

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

                            localNewsData = this.state.searchNewsData.filter((item1) => {
                                  console.log("item iss }} ", item1);
                                let newsDate = moment(item1.publishedAt).format("YYYY-MM-DD");
                               
                                //  moment(newsDate).format("YYYY-MM-DD");
                                if (newsDate >= this.state.startDate && newsDate <= this.state.endDate) {
                                    return item1;

                                }
                            })
                            this.setState({
                                    searchNewsData: localNewsData,
                                    showSearchData: true
                                })
                            if (localNewsData.length <= 0) {
                                this.setState({
                                    showEmpty: true
                                })
                            }
                            })
                    return true;
                }
                if (this.state.startDate == "" && this.state.endDate == "") {
                    showMessage({
                        message: "Please select start date and end date",
                        type: "danger"
                    })
                    return;
                }
                if (this.state.startDate == "") {
                    showMessage({
                        message: "Please select start date",
                        type: "danger"
                    })
                    return;
                }
                if (this.state.endDate == "") {
                    showMessage({
                        message: "Please select end date",
                        type: "danger"
                    })
                    return;
                }

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
        
                console.log("called");
                this.setState({
                    loading: true,
                    showSearchData: true,
                    searchNewsData:[],
                });
        
                Axios.get("https://newsapi.org/v2/everything?q=apple&from=" + this.state.startDate + "&to=" + this.state.endDate + "&pageSize=20&page=" + this.state.searchOffset + "&apiKey=aa2ed565090b43a5a40b236e76f4cd88")
                    .then((res) => {
                        console.log(res, "search data is");
                        console.log(this.state.startDate, "start date is");
                        console.log(this.state.endDate, "end date is");
                        let searchArray = [];
                        searchArray = res.data.articles
                        if(searchArray <= 0 ) {
                            this.setState({
                                showEmpty:true
                            })
                        }
                        this.setState({
        
                            loading: false,
                            searchNewsData: this.state.searchNewsData.concat(res.data.articles),
                        })
                        AsyncStorage.setItem("searchData", JSON.stringify(this.state.searchNewsData));
                    })
                    .catch((error) => {
                        console.log("error is }} ",error);
                        showMessage({
                            message:"Something went wrong ",
                            type:"danger"
                        })
                        this.setState({
                            loading: false
                        })
                    })
            });
    }

    _onCancelPress = () => {

        if (this.state.startDate == "" && this.state.endDate == "") {
           
            return;
        }
        if (this.state.startDate == "") {
           
            return;
        }
        if (this.state.endDate == "") {
          
            return;
        }

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
                            console.log('on cancel item is ' + JSON.stringify(item));
                            let newsData = JSON.parse(item)
                            this.setState({
                                showSearchData: false,
                                newsData: JSON.parse(item),
                                list: this.state.list.concat(newsData.slice(this.state.offset, this.state.limit)),
                                startDate: "",
                                endDate: "",
                            })
                        })
                    return true;
                }
                this.setState({
                    showSearchData: false,
                    startDate: "",
                    endDate: "",
                    searchNewsData: [],
                })
            });
    }

    fetchLoadmore = () => {
        NetInfo
        .fetch()
        .then((state) => {
            let isConnected = state.isConnected;

            if(!isConnected) {
                return;
            }
            if (!this.state.showSearchData) {
                this.setState({
                    loading: true,
                    offset: this.state.offset + 1
                }, () => this._fetchNews())
                return;
            } this.setState({
                loading: true,
                searchOffset: this.state.searchOffset + 1
            }, () => this._onSearchPress())
        })

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
                        <Icon name="calendar" type="AntDesign" style={{ color: "black", fontSize: 20 }} />
                        <Text style={{
                            alignSelf: 'center',
                            fontSize: 15,
                            color: "black"
                        }}>
                            {
                                (this.state.startDate == "")
                                    ? " Start Date"
                                    : " "+this.state.startDate
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
                        <Icon name="calendar" type="AntDesign" style={{ color: "black", fontSize: 20, }} />
                        <Text style={{
                            alignSelf: 'center',
                            fontSize: 15,
                            color: "black"
                        }}>
                            {
                                (this.state.endDate == "")
                                    ? " End Date"
                                    : " "+ this.state.endDate
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
                        //  data={this.state.newsData}
                        data={(!this.state.showSearchData) ? this.state.newsData : this.state.searchNewsData}

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
