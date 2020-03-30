/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {Navigation} from 'react-native-navigation';
import {
  Container,
  Header,
  Button,
  Icon,
  Input,
  Item,
  Fab,
  Root,
} from 'native-base';

import {API_URL, API_JSON_HEADER} from '../../../appSetting';
import ListItem from '../../components/InformationListItem/InformationListItem';
import {showDangerToast} from '../../helper';

// eslint-disable-next-line react-native/no-inline-styles

class InformationList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      data: [],
      page: 1,
      isSelectAll: false,
      loading: false,
      selectedItems: [],
      active: false,
      isSearch: false,
    };

    Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    this.handleFetch();
  }

  navigationButtonPressed({buttonId}) {
    if (buttonId === 'sideDrawerToggle') {
      this.toggleDrawer();
    }
  }

  toggleDrawer = () => {
    const {componentId} = this.props;

    Navigation.mergeOptions(componentId, {
      sideMenu: {
        left: {
          visible: true,
        },
      },
    });
  };

  fetchData = async page => {
    try {
      let url = API_URL + 'information/page/' + page;
      const res = await axios.get(url);

      const data = res.data.data.map(item => {
        item.isSelected = false;
        item.selectedClass = styles.list;
        return item;
      });

      this.setState({data: data});
    } catch (err) {
      showDangerToast(err);
      console.log(err);
    }
  };

  handleFetch = async () => {
    this.setState({isRefreshing: true});
    await this.fetchData(this.state.page);
    this.setState({isRefreshing: false});
  };

  handleLoadMore = () => {
    if (!this.state.loading && !this.state.isSearch) {
      this.setState({isRefreshing: true});
      this.setState({page: this.state.page + 1});
      this.fetchData(this.state.page);
      this.setState({isRefreshing: false});
    }
  };

  handleSelectItem = item => {
    item.isSelected = !item.isSelected;
    item.selectedClass = item.isSelected ? styles.selected : {};

    const index = this.state.data.findIndex(x => item.id === x.id);
    this.state.data[index] = item;
    this.setState({
      data: this.state.data,
    });

    if (item.isSelected) {
      this.setState({selectedItems: [...this.state.selectedItems, item.id]});
    } else {
      this.setState({
        selectedItems: this.state.selectedItems.filter(x => x !== item.id),
      });
    }
  };

  handleItemPress = item => {
    const title = 'Edit Informasi';
    Navigation.push(this.props.componentId, {
      component: {
        name: 'eslip.InformationFormScreen',
        passProps: {
          data: item,
        },
        options: {
          topBar: {
            title: {
              text: title,
            },
          },
        },
      },
    });
  };

  handleSearch = async keywords => {
    try {
      const url = API_URL + 'information/search';
      const res = await axios.post(url, {keywords}, API_JSON_HEADER);

      const data = res.data.data.map(item => {
        item.isSelected = false;
        item.selectedClass = styles.list;
        return item;
      });

      this.setState({data: data, isSearch: keywords.length > 0});

      console.log(this.state.data);
    } catch (err) {
      console.log(err);
    }
  };

  handleSelectAll = () => {
    this.state.isSelectAll = !this.state.isSelectAll;

    const selectAll = this.state.data.map(item => {
      item.isSelected = this.state.isSelectAll;
      item.selectedClass = item.isSelected ? styles.selected : {};
      return item;
    });

    this.setState({
      data: selectAll,
      selectedItems: this.state.isSelectAll
        ? selectAll.map(item => item.id)
        : [],
    });
  };

  handleDelete = async () => {
    const {selectedItems} = this.state;

    if (selectedItems.length > 0) {
      try {
        const url = API_URL + '/information/multidelete';
        await axios.post(url, {ids: selectedItems}, API_JSON_HEADER);

        this.fetchData();
      } catch (err) {
        showDangerToast(err);
        console.log(err);
      }
    }

    console.log('selectedItems:', this.state.selectedItems);
  };

  handleAdd = () => {
    const title = 'Add Informasi';
    Navigation.push(this.props.componentId, {
      component: {
        name: 'eslip.InformationFormScreen',
        passProps: {
          data: null,
        },
        options: {
          topBar: {
            title: {
              text: title,
            },
          },
        },
      },
    });
  };

  handleEdit = item => {
    const title =
      item.title.length > 30 ? item.title.substr(0, 30) + '...' : item.title;
    Navigation.push(this.props.componentId, {
      component: {
        name: 'eslip.InformationFormScreen',
        passProps: {
          data: item,
        },
        options: {
          topBar: {
            title: {
              text: title,
            },
          },
        },
      },
    });
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 2,
          width: '100%',
          backgroundColor: '#ccc',
        }}
      />
    );
  };

  renderFooter = () => {
    //it will show indicator at the bottom of the list when data is loading otherwise it returns null
    if (!this.state.loading) {
      return null;
    }
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  renderFab = () => (
    <Fab
      active={this.state.active}
      direction="up"
      containerStyle={{}}
      style={{backgroundColor: '#5067FF'}}
      position="bottomRight"
      onPress={() => this.setState({active: !this.state.active})}>
      <Icon name="md-more" />
      <Button style={{backgroundColor: '#34A34F'}} onPress={this.handleAdd}>
        <Icon name="md-add" />
      </Button>
      <Button
        style={{backgroundColor: '#3B5998'}}
        onPress={this.handleSelectAll}>
        <Icon name="md-checkmark" />
      </Button>
      <Button style={{backgroundColor: '#DD5144'}} onPress={this.handleDelete}>
        <Icon name="md-trash" />
      </Button>
    </Fab>
  );

  render() {
    if (this.state.loading && this.state.page === 1) {
      return (
        <View
          style={{
            width: '100%',
            height: '100%',
          }}>
          <ActivityIndicator style={{color: '#000'}} />
        </View>
      );
    }

    return (
      <Root>
        <Container>
          <Header searchBar rounded style={styles.header}>
            <Item>
              <Icon name="ios-search" />
              <Input
                placeholder="Search"
                onChangeText={text => this.handleSearch(text)}
              />
            </Item>
            <Button transparent>
              <Text>Search</Text>
            </Button>
          </Header>
          <View style={{flex: 1}}>
            <FlatList
              data={this.state.data}
              extraData={this.state}
              refreshControl={
                <RefreshControl
                  onRefresh={this.handleFetch}
                  refreshing={this.state.isRefreshing}
                />
              }
              renderItem={({item}) => (
                <ListItem
                  data={item}
                  onSelected={() => this.handleSelectItem(item)}
                  onLongPress={() => this.handleSelectItem(item)}
                  onPress={() => this.handleItemPress(item)}
                  style={item.selectedClass}
                  selected={item.isSelected}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.renderSeparator}
              ListFooterComponent={this.renderFooter}
              onEndReachedThreshold={0.4}
              onEndReached={this.handleLoadMore}
            />
            {this.renderFab()}
          </View>
        </Container>
      </Root>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2f353a',
  },
  selected: {backgroundColor: '#cece'},
});

export default InformationList;
