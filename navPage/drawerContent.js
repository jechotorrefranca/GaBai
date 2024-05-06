import React, { useEffect, useState } from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Avatar, Title} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import img from '../assets/stan.jpg';
const imgUri = Image.resolveAssetSource(img).uri

function DrawerContent(props) {

    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      const unsubscribe = db
        .collection('users')
        .doc(auth.currentUser?.uid)
        .onSnapshot((doc) => {
          if (doc.exists) {
            setUserData(doc.data());
          }
        });
  
      return () => unsubscribe();
    }, []);

const DrawerList = [
  {icon: 'settings', label: 'Settings', navigateTo: 'Settings'},
];
const DrawerLayout = ({icon, label, navigateTo}) => {

  return (
    <DrawerItem
      icon={() => <Ionicons name={icon} color='#8a344c' size={24} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo);
      }}
    />
  );
};

const DrawerItems = () => {
    return DrawerList.map((el, i) => {
      return (
        <DrawerLayout
          key={i}
          icon={el.icon}
          label={el.label}
          navigateTo={el.navigateTo}
        />
      );
    });
  };

  const handleSignOut = () => {
    auth
    .signOut()
    .then(() => {
        navigation.replace("Login")
    })
    .catch(error => alert(error.message))
      
    };

  return (
    <View style={{flex: 1, backgroundColor: '#edd9df'}}>
      <DrawerContentScrollView {...props}>

        <View style={styles.drawerContent}>

          <View activeOpacity={0.8}>
            <View style={styles.userInfoSection}>
                <View style={{marginVertical: 15, alignItems: 'center'}}>
                    <Avatar.Image
                    source={{
                        uri: imgUri, //PFP PICTUE HERE
                    }}
                    size={150}
                    style={{marginTop: 5}}
                    />
                    
                    <View style={{flexDirection: 'column', }}>
                      <Title style={styles.title}>{userData?.username}</Title>
                      <Text style={styles.caption} numberOfLines={1}>
                        {userData?.First_Name} {userData?.Surname}
                      </Text>
                    </View>
              </View>
            </View>
          </View>

          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>

      </DrawerContentScrollView>

      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={() => (
            <Ionicons name="exit" color='#8a344c' size={24} />
          )}
          label="Sign Out"
          onPress={handleSignOut}
        />
      </View>

    </View>
  );
}
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    //backgroundColor: 'blue',
    justifyContent: 'center',
  },
  userInfoSection: {
    //backgroundColor: 'yellow',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginTop: 5,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  caption: {
    fontSize: 15,
    lineHeight: 14,
    // color: '#6e6e6e',
    textAlign: 'center'
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    backgroundColor: '#f4e9ec'
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});