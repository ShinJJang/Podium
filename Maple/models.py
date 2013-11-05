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
        return "%s's profile" % self.user


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
    open_scope = models.IntegerField(default=0)  # 0 = open, 1 = semi-open, 2 = close

    def open_scope_str(self):
        result = None
        if self.open_scope == 0:
            result = "모두에게 공개"
        if self.open_scope == 1:
            result = "멤버들에게만 공개"
        if self.open_scope == 2:
            result = "비공개"
        return result


class Posts(models.Model):
    user_key = models.ForeignKey(User, related_name='user_key')
    post = models.CharField(max_length=4096)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)
    group = models.ForeignKey(Groups, null=True)
    open_scope = models.IntegerField(default=0)    # 0 = public, 1 = private, 2 = target user, 3 = group
    target_user = models.ForeignKey(User, null=True, related_name='target_user')
    # 0 = not attached, 1 = photo, 2 = video, 3 = file, 4 = poll, 5 = rich text
    attachment_type = models.IntegerField(default=0)


def create_friend_post(sender, instance, created, **kwargs):
    if created:
        write_user = instance.user_key

        if instance.open_scope == 1:
            # 자신에게 글 저장 - private은 그냥 post로 처리해도 되지만 template를 따로 만들어야되는 비용이 있음
            FriendPosts.objects.get_or_create(user_key=write_user, friend_post_key=instance)

        # 친구들에게 글 저장
        if instance.open_scope == 0 or instance.open_scope == 2:
            # 자신에게 글 저장 - 그룹에서는 멤버도 자신을 포함하므로 따로 넣어주지 않음
            FriendPosts.objects.get_or_create(user_key=write_user, friend_post_key=instance)
            friendships = Friendships.objects.filter(user_key=write_user)
            for friendship in friendships:
                FriendPosts.objects.get_or_create(user_key=friendship.friend_user_key, friend_post_key=instance)

        elif instance.open_scope == 3:
            memberships = Memberships.objects.filter(group_key=instance.group.pk)
            for membership in memberships:
                FriendPosts.objects.get_or_create(user_key=membership.user_key, friend_post_key=instance)
            GroupPosts.objects.get_or_create(group_key=instance.group, post_key=instance)
            # TODO - Post template가 post model 기반이라 쓰려면 grouppost는 따로 전처리가 필요함

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
    emotion = models.CharField(max_length=2, choices=EMOTION_CHOICES)  # default = None?
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)


class PostEmotions(Emotions):
    post_key = models.ForeignKey(Posts)


class CommentEmotions(Emotions):
    comment_key = models.ForeignKey(Comments)


class UserPictures(models.Model):
    user_key = models.ForeignKey(User)
    picture = models.FileField(upload_to='upload/%y/%m/%d')
    name = models.CharField(max_length=30, null=False)
    created = models.DateTimeField(auto_now=True)


class PostPictures(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Posts)
    picture = models.FileField(upload_to='upload/%y/%m/%d')
    name = models.CharField(max_length=30, null=False)
    created = models.DateTimeField(auto_now=True)


class UserFileCount(models.Model):
    user_key = models.ForeignKey(User)
    file_count = models.IntegerField(auto_created=True, default=0)


class UserFiles(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Posts)
    file_link = models.CharField(max_length=1000, null=False)
    file_name = models.CharField(max_length=500, null=False)
    created = models.DateTimeField(auto_now=True)
    file_type = models.CharField(max_length=100, null=False)


# Relation with friend
class Friendships(models.Model):
    user_key = models.ForeignKey(User, related_name='my_key')
    friend_user_key = models.ForeignKey(User, related_name='friend_key')
    created = models.DateTimeField(auto_now=True)


def create_friendship_each(sender, instance, created, **kwargs):
    if created:
        Friendships.objects.get_or_create(user_key=instance.friend_user_key, friend_user_key=instance.user_key)

post_save.connect(create_friendship_each, sender=Friendships)


# Relation sending friend request
class FriendshipNotis(models.Model):
    friend_noti_from_user_key = models.ForeignKey(User, related_name='request_from')
    friend_noti_to_user_key = models.ForeignKey(User, related_name='request_to')
    created = models.DateTimeField(auto_now=True)


class Notices(models.Model):
    subject = models.CharField(max_length=40)
    content = models.CharField(max_length=2000)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)
    # need to add files


class FriendPosts(models.Model):
    user_key = models.ForeignKey(User, related_name='my_user_key')
    friend_post_key = models.ForeignKey(Posts, related_name='friend_post_key')


class Polls(models.Model):
    post_key = models.ForeignKey(Posts, related_name='polls')
    poll = models.CharField(max_length=4000)


class Videos(models.Model):
    post_key = models.ForeignKey(Posts, related_name="videos")
    video = models.CharField(max_length=1024)


class GroupPosts(models.Model):
    group_key = models.ForeignKey(Groups)
    post_key = models.ForeignKey(Posts)


class Memberships(models.Model):
    group_key = models.ForeignKey(Groups)
    user_key = models.ForeignKey(User)
    permission = models.IntegerField(default=0)  # 0 = common, 1 = manager, 2 = owner
    created = models.DateTimeField(auto_now=True)


class MembershipNotis(models.Model):
    noti_group_key = models.ForeignKey(Groups)
    noti_user_key = models.ForeignKey(User)
    created = models.DateTimeField(auto_now=True)

#revolution chat!
class ChatRoom(models.Model):
    chat_room_name = models.CharField(max_length=1000)
    participant_count = models.IntegerField(default=0)


class ChatNotification(models.Model):
    chat_room_key = models.ForeignKey(ChatRoom)
    from_user_key = models.ForeignKey(User, related_name='message_from_user')
    to_user_key = models.ForeignKey(User, related_name='message_to_user')


class ChatParticipants(models.Model):
    chat_room_key = models.ForeignKey(ChatRoom)
    user_key = models.ForeignKey(User)
    connected_chat = models.BooleanField(default=False)


class UserChattingMessage(models.Model):
    chat_room_key = models.ForeignKey(ChatRoom)
    user_key = models.ForeignKey(User)
    chatting_message = models.CharField(max_length=1000)
    created = models.DateTimeField(auto_now=True)


class TestModel(models.Model):
    test = models.ForeignKey(ChatRoom)
    testbaekmodel = models.CharField(max_length=1000)