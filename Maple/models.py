# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
import jsonfield

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    login_status = models.IntegerField(default=0)
    updated = models.DateTimeField(auto_now=True)
    def __str__(self):
        return  "%s's profile" % self.user

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

post_save.connect(create_user_profile, sender=User)

class Groups(models.Model):
    group_name = models.CharField(max_length=30)
    description = models.CharField(max_length=4096)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)
    isProject = models.BooleanField()

class Posts(models.Model):
    user_key = models.ForeignKey(User, related_name='user_key')
    post = models.CharField(max_length=4096)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)
    group = models.ForeignKey(Groups, null=True)
    open_scope = models.IntegerField(default=0) # 0 = public, 1 = private, 2 = target user, 3 = group
    target_user = models.ForeignKey(User, null=True, related_name='target_user')
    attachment_type = models.IntegerField(default=0) # 0 = not attached, 1 = photo, 2 = video, 3 = file, 4 = poll

def create_friend_post(sender, instance, created, **kwargs):
    if created:
        write_user = instance.user_key

        # 자신에게 글 저장
        FriendPosts.objects.get_or_create(user_key=write_user, friend_post_key=instance)

        # 친구들에게 글 저장
        if(instance.open_scope == 0 | instance.open_scope == 2):
            friendships = Friendships.objects.filter(user_key=write_user) # TODO - friendship
            for friendship in friendships:
                 FriendPosts.objects.get_or_create(user_key=friendship.friend_user_key, friend_post_key=instance)

        elif(instance.open_scope == 3):
            memberships = Memberships.objects.filter(group_key=instance.group.pk); # TODO - membership
            for membership in memberships:
                FriendPosts.objects.get_or_create(user_key=membership, friend_post_key=instance)
            GroupPosts.objects.get_or_create(group_key=instance.group, post_key=instance)

post_save.connect(create_friend_post, sender=Posts)

class Comments(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Posts)
    comment = models.CharField(max_length=1024)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)

class Emotions(models.Model):
    LIKE = 'E1'
    GOOD = 'E2'
    EMOTION_CHOICES = (
        (LIKE, 'like'),
        (GOOD, 'good'),
    )
    user_key = models.ForeignKey(User)
    emotion = models.CharField(max_length=2, choices=EMOTION_CHOICES) # default = None?
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)

class PostEmotions(Emotions):
    post_key = models.ForeignKey(Posts)

class CommentEmotions(Emotions):
    comment_key = models.ForeignKey(Comments)

class UserPictures(models.Model):
    user_key = models.ForeignKey(User)
    picture = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

class PostPictures(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Posts)
    picture = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

class Files(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Posts)
    file = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

# Relation with friend
class Friendships(models.Model):
    user_key = models.ForeignKey(User, related_name='my_key')
    friend_user_key = models.ForeignKey(User, related_name='friend_key')

# Relation sending friend request
class FriendshipNotis(models.Model):
    friend_noti_from_user_key = models.ForeignKey(User, related_name='request_from')
    friend_noti_to_user_key = models.ForeignKey(User, related_name='request_to')
    created = models.DateTimeField(auto_now=True)

class UserChats(models.Model):
    chat_from_user_key = models.ForeignKey(User, related_name = 'UserChats_from_user') #chat_user
    chat_to_user_key = models.ForeignKey(User, related_name = 'UserChats_to_user') #chat_with_user
    chat_room_name = models.CharField(max_length=255)

class ChatNotis(models.Model):
    noti_from_user_key = models.ForeignKey(User, related_name = 'ChatNoti_from_user')#from_user
    noti_to_user_key = models.ForeignKey(User, related_name = 'ChatNoti_to_user')#to_user

class ChatComments(models.Model):
    userChat_key = models.ForeignKey(UserChats)
    chat_comment = models.CharField(max_length=255)

class Notices(models.Model):
    subject = models.CharField(max_length=40)
    content = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)
    # need to add files

class FriendPosts(models.Model):
    user_key = models.ForeignKey(User, related_name='my_user_key')
    friend_post_key = models.ForeignKey(Posts, related_name='friend_post_key')

class ChatTables(models.Model):
    from_chatting_user = models.ForeignKey(User, related_name = 'from_ChatTable_user')
    to_chatting_user = models.ForeignKey(User, related_name = 'to_ChatTable_user')

class Polls(models.Model):
    post_key = models.ForeignKey(Posts, related_name = 'polls')
    poll = models.CharField(max_length=4000)
    # poll = jsonfield.JSONfield

class GroupPosts(models.Model):
    group_key = models.ForeignKey(Groups)
    post_key = models.ForeignKey(Posts)

class Memberships(models.Model):
    group_key = models.ForeignKey(Groups)
    user_key = models.ForeignKey(User)
