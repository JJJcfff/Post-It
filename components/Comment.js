import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

const Comment = ({ comment, addReply, likeComment }) => {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleReply = () => {
        addReply(comment.id, replyText);
        setReplyText('');
        setShowReply(false);
    };

    return (
        <View style={{ marginLeft: 20 * comment.level, marginTop: 10 }}>
            <Text>{comment.text}</Text>
            <Text style={{ fontSize: 12, color: 'grey' }}>Likes: {comment.likes}</Text>
            <TouchableOpacity onPress={() => likeComment(comment.id)}>
                <Text>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowReply(!showReply)}>
                <Text>Reply</Text>
            </TouchableOpacity>
            {showReply && (
                <View>
                    <TextInput
                        value={replyText}
                        onChangeText={setReplyText}
                        placeholder="Type your reply"
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    />
                    <TouchableOpacity onPress={handleReply}>
                        <Text>Send</Text>
                    </TouchableOpacity>
                </View>
            )}
            {comment.replies.map(reply => (
                <Comment key={reply.id} comment={reply} addReply={addReply} likeComment={likeComment} />
            ))}
        </View>
    );
};

export default Comment;
