import React, {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Thumbnail} from 'native-base';

import profilePicture from '../../assets/images/rama.jpg';

class UserPanel extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Thumbnail
          source={{uri: 'http://hrinformationsystem.com:3001/photos/admin.png'}}
        />
        <Image style={styles.profilePicture} source={profilePicture} />
        <Text style={styles.title}>{this.props.name}</Text>
        <Text style={styles.title}>{this.props.nik}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    borderWidth: 2,
    borderColor: '#222',
  },
  title: {
    color: 'white',
  },
});

export default UserPanel;
