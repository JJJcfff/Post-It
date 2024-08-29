import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { firebaseapp, firebaseauth } from '../FirebaseConfig';
import { collection, getFirestore, orderBy, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { Image as CachedImage } from 'react-native-expo-image-cache';
import useAppStyles from "../styles/useAppStyles";
import useAppColors from "../styles/useAppColors";

const firestore = getFirestore(firebaseapp);

const Home = ({ navigation }) => {
    const styles = useAppStyles().styles;
    const homeStyles = useAppStyles().homeStyles;
    const colors = useAppColors();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userNotes, setUserNotes] = useState([]);
    const [userEmojis, setUserEmojis] = useState([]);
    const [maxDuration, setMaxDuration] = useState(1);

    useEffect(() => {
        const setAuthUser = () => {
            const user = firebaseauth.currentUser;
            if (user) {
                setCurrentUserId(user.uid);
            }
        };

        const unsubscribe = firebaseauth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUserId(user.uid);
            }
        });
        setAuthUser();

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let unsubscribeNotes = null;
        let unsubscribeEmojis = null;

        if (currentUserId) {
            unsubscribeNotes = subscribeToUserNotes();
            unsubscribeEmojis = subscribeToUserEmojiHistory();
        }

        return () => {
            if (unsubscribeNotes) unsubscribeNotes();
            if (unsubscribeEmojis) unsubscribeEmojis();
        };
    }, [currentUserId]);

    const subscribeToUserNotes = () => {
        const markerCollection = collection(firestore, 'stickyNoteMarkers');
        const q = query(markerCollection, where('user', '==', currentUserId), orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const userNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserNotes(userNotes);
        }, (error) => {
            console.error("Error fetching user notes:", error);
        });
    };

    const subscribeToUserEmojiHistory = () => {
        const emojiHistoryCollection = collection(firestore, 'emojiHistory');
        const past72Hours = Timestamp.now().toDate();
        past72Hours.setHours(past72Hours.getHours() - 72);

        const q = query(
          emojiHistoryCollection,
          where('userId', '==', currentUserId),
          where('createdAt', '>=', Timestamp.fromDate(past72Hours)),
          orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const emojiHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const aggregatedEmojis = [];
            let currentEmoji = null;
            let maxDurationHours = 1;

            emojiHistory.forEach((item) => {
                const itemTime = new Date(item.createdAt.seconds * 1000);

                if (currentEmoji && currentEmoji.emoji === item.emoji) {
                    currentEmoji.count += 1;
                    currentEmoji.endTime = itemTime;
                } else {
                    if (currentEmoji) {
                        aggregatedEmojis.push(currentEmoji);
                        const durationHours = calculateDurationInHours(currentEmoji.startTime, currentEmoji.endTime);
                        maxDurationHours = Math.max(maxDurationHours, durationHours);
                    }
                    currentEmoji = {
                        ...item,
                        count: 1,
                        startTime: itemTime,
                        endTime: itemTime,
                    };
                }
            });

            if (currentEmoji) {
                aggregatedEmojis.push(currentEmoji);
                const durationHours = calculateDurationInHours(currentEmoji.startTime, currentEmoji.endTime);
                maxDurationHours = Math.max(maxDurationHours, durationHours);
            }

            setMaxDuration(maxDurationHours);
            setUserEmojis(aggregatedEmojis);
        }, (error) => {
            console.error("Error fetching user emoji history:", error);
        });
    };

    const calculateDurationInHours = (startTime, endTime) => {
        const durationMs = endTime - startTime;
        return Math.max(Math.round(durationMs / (1000 * 60 * 60)), 1); // at least 1 hour
    };

    const navigateToMarker = (marker) => {
        navigation.navigate('Map', { marker });
    }

    const renderNoteItem = ({ item }) => (
      <TouchableOpacity onPress={() => navigateToMarker(item)}>
          <View style={[homeStyles.noteItem, { backgroundColor: item.color || 'yellow' }]}>
              {(item.imageUris && item.imageUris.length !== 0 && item.imageUris[0] !== '') ? (
                <View>
                    <Text style={[styles.h4Text, { color: item.textColor || 'black' }]} numberOfLines={2}>
                        {item.text}
                    </Text>
                    <CachedImage
                      uri={item.imageUris[0]}
                      style={{ width: 150, height: 150, borderRadius: 5 }}
                    />
                </View>
              ) : (
                <Text style={[styles.h4Text, { color: item.textColor || 'black' }]} numberOfLines={5}>
                    {item.text}
                </Text>
              )}
              <Text style={[styles.captionText, { color: item.textColor || 'grey', paddingTop: 5 }]}>
                  Likes: {item.likes}
              </Text>
              <Text style={[styles.captionText, { color: item.textColor || 'grey' }]}>
                  Comments: {item.comments.length}
              </Text>
              <Text style={[styles.captionText, { color: item.textColor || 'grey' }]} numberOfLines={2}>
                  Tags: {item.tags.length > 0 ? item.tags.join(', ') : ''}
              </Text>
          </View>
      </TouchableOpacity>
    );

    const renderEmojiItem = ({ item }) => {
        const durationHours = calculateDurationInHours(item.startTime, item.endTime);
        const width = Math.max(60, (durationHours / maxDuration) * 200); // Dynamically scale width with a base of 60 and max of 200

        const timeAgo = (time) => {
            const now = new Date();
            const diffMs = now - time;

            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);

            if (diffHours > 0) {
                return `${diffHours}h${diffMinutes-diffHours*60}m ago`;
            } else if (diffMinutes > 0) {
                return `${diffMinutes}m ago`;
            } else {
                return `${diffSeconds}s ago`;
            }
        };

        const startTimeText = timeAgo(item.startTime);
        const endTimeText = timeAgo(item.endTime);

        return (
          <View style={[homeStyles.emojiItem, { width }]}>
              {item.count > 1 ? (
                <>
                    <View style={styles.flexRow}>
                        <Text style={homeStyles.emojiText}>
                            {item.emoji}
                        </Text>
                        <Text>
                            {`+${item.count - 1}`}
                        </Text>
                    </View>
                    <Text style={styles.emojiTimeText}>{startTimeText}</Text>
                </>
              ) : (
                <>
                    <Text style={homeStyles.emojiText}>{item.emoji}</Text>
                    <Text style={styles.emojiTimeText}>{startTimeText}</Text>
                </>
              )}
          </View>
        );
    };

    return (
      <View style={[styles.container, { padding: 10 }]}>
          <ScrollView style={styles.scrollContainer}>
              <Text style={[styles.h3Text, { marginBottom: 10 }]}>Recent Activity</Text>
              <View style={homeStyles.section}>
                  <FlatList
                    data={userNotes}
                    horizontal={true}
                    renderItem={renderNoteItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                  />
              </View>

              <Text style={[styles.h3Text, { marginBottom: 10 }]}>Your Emoji Timeline (Last 72 Hours)</Text>
              <View style={homeStyles.section}>
                  <FlatList
                    data={userEmojis}
                    horizontal={true}
                    renderItem={renderEmojiItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                  />
              </View>
          </ScrollView>
      </View>
    );
};

export default Home;
