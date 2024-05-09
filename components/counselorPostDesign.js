import React,  {useEffect}  from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, TouchableHighlight } from 'react-native'
import { Octicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from 'react';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { db, auth, firebase } from '../firebase';
import EditPostCounselor from './editPostCounselor';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Ionicons } from '@expo/vector-icons';

const CounselorPostDesign = ({ item }) => {

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const fetchUserData = async () => {
          const userDoc = await db.collection('users').doc(auth.currentUser?.uid).get();
          if (userDoc.exists) {
              setCurrentUser(userDoc.data());
          }
      };
      fetchUserData();
  
      const unsubscribe = db.collection('users').doc(auth.currentUser?.uid)
          .onSnapshot((doc) => {
              if (doc.exists) {
                  setCurrentUser(doc.data());
              }
          });
  
      return () => unsubscribe();
  }, []);

    
    
  const [firebaseImageUrl, setFirebaseImageUrl] = useState(null);
  const [firebaseImageUrlp, setFirebaseImageUrlp] = useState(null);

  useEffect(() => {
    const fetchThreadImage = async () => {
      try {
        const threadSnapshot = await db.collection('threads').doc(item.id).get();
        if (threadSnapshot.exists) {
          const threadData = threadSnapshot.data();
          if (threadData.image && threadData.image.img) {
            setFirebaseImageUrlp(threadData.image.img);
          } else {
            setFirebaseImageUrlp(null);
          }
        } else {
          setFirebaseImageUrlp(null);
        }
      } catch (error) {
        console.error('Error fetching thread image:', error);
      }
    };
  
    fetchThreadImage();
  }, [item.id]);
  

  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        const username = item.username;
        const userSnapshot = await db.collection('users').where('username', '==', username).get();
        if (!userSnapshot.empty) {
          const user = userSnapshot.docs[0].data();
          setFirebaseImageUrl(user.img || null);
        } else {
          setFirebaseImageUrl(null);
        }
      } catch (error) {
        console.error('Error fetching user image:', error);
      }
    };

    fetchUserImage();
  }, [item.username]);

  
    const [user, setUser] = useState(null);

    useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
    });
    return unsubscribe;
    }, []);

    useEffect(() => {
    const fetchPfp = async (uid) => {
        try {
        const userRef = firebase.firestore().collection('users').doc(uid);
        const unsubscribe = userRef.onSnapshot((doc) => {
            const pfpURL = doc.data().img;
            if (pfpURL) {
            setFirebaseImageUrl(pfpURL);
            } else {
            setFirebaseImageUrl(null);
            }
        });
        return () => unsubscribe();
        } catch (error) {
        console.error(error);
        }
    };

    if (user) {
        fetchPfp(user.uid);
    }
    }, [user]);

    const [modalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const [modalImgVisible, setModalImgVisible] = useState(false);

    const toggleImgModal = () => {
        setModalImgVisible(!modalImgVisible);
    };

    const submit = () => {
        toggleModal()
    }

    const editOption = () => {
        toggleModal();
    };

    
    const deleteOption = () => {
        Alert.alert(
            'Delete Post?',
            'Are you sure you want to delete this post?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                { text: 'Delete', onPress: deletePost },
            ],
            { cancelable: true }
        );
    };
    
    const deletePost = async () => {
        try {
            // Get the post image URL
            const threadSnapshot = await db.collection('threads').doc(item.id).get();
            if (threadSnapshot.exists) {
                const threadData = threadSnapshot.data();
                if (threadData.image && threadData.image.img) {
                    const imageUrl = threadData.image.img;
                    // Delete the post image from Firebase Storage
                    const imageRef = firebase.storage().refFromURL(imageUrl);
                    await imageRef.delete();
                }
            }
            // Delete the post document from Firestore
            await db.collection('threads').doc(item.id).delete();
            console.log('Post deleted successfully!');
        } catch (error) {
            console.error('Error deleting post: ', error);
        }
    };
    

    const [isLiked, setIsLiked] = useState(false);

    const toggleLike = () => {
        setIsLiked(!isLiked);
    };

    return (
        <View style={styles.allCont}>
          {/* Modal components */}
          <Modal 
            transparent={true} 
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => {}}>
            <View style={styles.modalContainer}>
              <EditPostCounselor item={item} onPress={toggleModal} submit={() => setModalVisible(false)}/>
            </View>
          </Modal>
    
          <Modal
            visible={modalImgVisible}
            transparent={true}
            animationType="fade">
            <ImageViewer
              imageUrls={[{ url: firebaseImageUrlp}]}
              enableSwipeDown={true}
              onSwipeDown={toggleImgModal}
              renderIndicator={() => null}
              style={styles.modalImage}/>
    
            <TouchableOpacity style={styles.closeButton} onPress={toggleImgModal}>
              <Ionicons name="close-circle" size={34} color="white" />
            </TouchableOpacity>
          </Modal>
    
          <View style={{margin: 5}}>
            <View style={styles.profileName}>
              <View style={styles.topItems}>
                <View style={styles.pfpCont}>
                  <TouchableOpacity>
                    <Image
                      style={styles.pfp}
                      resizeMode='cover'
                      source={firebaseImageUrl ? { uri: firebaseImageUrl } : require('../assets/defaultPfp.jpg')}
                      onError={(error) => console.error('Image loading error:', error)}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                  <Text style={{fontWeight: 'bold', fontSize: 12, ellipsizeMode: 'tail', numberOfLines: 1}}>
                    {item.username}
                  </Text>
                  <View style={styles.datePosted}>
                    <Text style={{color: 'grey', fontSize: 12}}>
                      {item.createdAt}
                    </Text>
                  </View>
                </View>
              </View>
    
              <View style={styles.settingsIcon}>
{currentUser && currentUser.username === item.username && (
    <Menu name={`menu-${item.id}`}>
        <MenuTrigger>
            <View style={{ width: 20, height: 20, transform: [{ rotate: '90deg' }] }}>
                <Octicons name="kebab-horizontal" size={20} color="black" />
            </View>
        </MenuTrigger>
        <MenuOptions customStyles={menuStyles}>
            <MenuOption onSelect={editOption} style={styles.menuItemStyle}>
                <Text style={styles.menuItemTextStyle}>Edit</Text>
            </MenuOption>
            <MenuOption onSelect={deleteOption} style={styles.menuItemStyle}>
                <Text style={styles.menuItemTextStyle}>Delete</Text>
            </MenuOption>
        </MenuOptions>
    </Menu>
    )}

              </View>
            </View>
    
            <View style={styles.postTitle}>
              <Text style={{fontWeight: 'bold', fontSize: 18}}>
                {item.content}
              </Text>
            </View>
    
            {firebaseImageUrlp && (
        <View style={styles.postPic}>
            <TouchableHighlight style={styles.imageContainer} onPress={toggleImgModal}>
            <Image 
                source={{ uri: firebaseImageUrlp }} 
                style={styles.image} />
            </TouchableHighlight>
        </View>
        )}

    
            <View style={styles.lowerButtonCont}> 
              <TouchableOpacity style={styles.icontainer} onPress={toggleLike}>
                <FontAwesome6 name="heart" size={24} color={isLiked ? 'red' : 'grey'} solid={isLiked} />
                <Text style={{fontSize: 12, color: 'grey', marginLeft: 5}}>{item.like}</Text>
              </TouchableOpacity>
    
              <TouchableOpacity style={styles.icontainer}>
                <FontAwesome6 name="comment-alt" size={24} color="grey"/>
                <Text style={{fontSize: 12, color: 'grey', marginLeft: 5}}>{item.comment}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

export default CounselorPostDesign


const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    
    modalRemoveButton: {
        width: '15%',
        aspectRatio: 1, // To make it a square
        backgroundColor: '#F3E8EB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100, // To make it a circle
        marginTop: 10
    },

    modalEditButton: {
        width: '25%',
        height: 35,
        backgroundColor: '#F3E8EB',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 10,
    },

    twoButtonsBelow: {
        width: '95%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    allCont: {
        alignSelf: 'center',
        width: '95%',
        borderBottomColor: '#E2AFBF',
        borderBottomWidth: 1,
        padding: 5,


    },

    profileName: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%'
    },

    settingsIcon: {
    },

    topItems: {
        flexDirection: 'row',
        alignItems: 'center',

    },

    pfp: {
        height: 35,
        borderRadius: 100,
        marginRight: 5,
        aspectRatio: 1
    },

    name: {
        marginRight: 5
    },

    postTitle: {
        marginTop: 5
    },

    lowerButtonCont: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-around',
    },

    icontainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemStyle: {
        padding: 10,
    },

    menuItemTextStyle: {
        fontSize: 16,
    },

    postPic: {
        marginTop: 10,
        
    },

    imageContainer: {
        elevation: 3,
        shadowColor: 'black',
        borderRadius: 15,
        
    },

    image: {
        width: '100%',
        height: 'auto',
        resizeMode: 'cover',
        aspectRatio: 1,
        borderRadius: 15,
    },

    modalImage: {
        flex: 1,
        backgroundColor: 'black',
    },

    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
    },


});

const menuStyles = {
    optionsContainer: {
        marginTop: -50,
        backgroundColor: '#F5F5F5',
        padding: 1,
        borderRadius: 10,
    },
};
