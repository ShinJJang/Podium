# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_syncdb
from django.shortcuts import get_object_or_404
import requests


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    login_status = models.IntegerField(default=0)
    updated = models.DateTimeField(auto_now=True)
    sex = models.IntegerField(null=True)  # 1 = Male, 2 = Female
    birthday = models.DateField(null=True)
    address = models.TextField(max_length=100, null=True)
    phone = models.TextField(max_length=20, null=True)
    ki = models.IntegerField(null=True)

    def __str__(self):
        return "%s's profile" % self.user


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

post_save.connect(create_user_profile, sender=User)


class HighSchools(models.Model):
    name = models.CharField(max_length=30)


class UserToHighSchool(models.Model):
    user = models.ForeignKey(User)
    highschool = models.ForeignKey(HighSchools)
    enter = models.DateField(null=True)
    graduate = models.DateField(null=True)


class University(models.Model):
    name = models.CharField(max_length=30)


class UserToUniversity(models.Model):
    user = models.ForeignKey(User)
    university = models.ForeignKey(University)
    enter = models.DateField(null=True)
    graduate = models.DateField(null=True)
    major = models.CharField(null=True, max_length=20)


class Teams(models.Model):
    name = models.CharField(max_length=30)
    mentor = models.ForeignKey(User)


class UserToTeam(models.Model):
    user = models.ForeignKey(User)
    team = models.ForeignKey(Teams)
    joinedOn = models.DateField()


class Companies(models.Model):
    name = models.CharField(max_length=30)


class UserToCompany(models.Model):
    user = models.ForeignKey(User)
    company = models.ForeignKey(Companies)
    enter = models.DateField(null=True)
    leave = models.DateField(null=True)
    job = models.CharField(max_length=30)


class Hobbies(models.Model):
    name = models.CharField(max_length=30)


class UserToHobby(models.Model):
    user = models.ForeignKey(User)
    hobby = models.ForeignKey(Hobbies)


class PLanguages(models.Model):
    name = models.CharField(max_length=30)


class UserToPLanguage(models.Model):
    user = models.ForeignKey(User)
    planguage = models.ForeignKey(PLanguages)


class Groups(models.Model):
    group_name = models.CharField(max_length=30)
    description = models.CharField(max_length=4096)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)
    isProject = models.BooleanField()
    open_scope = models.IntegerField(default=0)  # 0 = open, 1 = semi-open, 2 = close
    github_repo = models.CharField(max_length=512, null=True)
    github_commit_last_id = models.CharField(max_length=64, null=True)

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

        if instance.open_scope != 3:
            # 자신에게 글 저장
            # - private은 그냥 post로 처리해도 되지만 template를 따로 만들어야되는 비용이 있음
            # - 그룹에서는 멤버도 자신을 포함하므로 따로 넣어주지 않음
            FriendPosts.objects.get_or_create(user_key=write_user, friend_post_key=instance)

        if instance.open_scope == 1 and instance.target_user != write_user:
            FriendPosts.objects.get_or_create(user_key=instance.target_user, friend_post_key=instance)

        # 친구들에게 글 저장
        if instance.open_scope == 0 or instance.open_scope == 2:
            friendships = Friendships.objects.filter(user_key=write_user)
            for friendship in friendships:
                FriendPosts.objects.get_or_create(user_key=friendship.friend_user_key, friend_post_key=instance)

        elif instance.open_scope == 3:
            memberships = Memberships.objects.select_related().filter(group_key=instance.group.pk)
            if instance.group.open_scope == 0:
                members = memberships.values_list('user_key', flat=True)
                friends = Friendships.objects.select_related().filter(user_key=write_user).values_list('friend_user_key', flat=True)

                # 친구와 그룹 멤버 user id union(중복 없이)
                user_ids = list(set(list(members) + list(friends)))

                # 친구와 그룹 멤버들에게 저장
                for user_id in user_ids:
                    FriendPosts.objects.get_or_create(user_key_id=user_id, friend_post_key=instance)

            else:
                for membership in memberships:
                    FriendPosts.objects.get_or_create(user_key=membership.user_key, friend_post_key=instance)

            GroupPosts.objects.get_or_create(group_key=instance.group, post_key=instance)

post_save.connect(create_friend_post, sender=Posts)


def create_log(sender, instance, created, **kwargs):
    emotion = None
    content = None
    where_owner = None
    where = None
    link = "/post/"
    if sender == Posts:
        if instance.open_scope == 1 or (instance.group and instance.group.open_scope != 0):
            return
        model_name = 'post'
        content = instance.post
        user = get_object_or_404(User, pk=instance.user_key.id)
        link += str(instance.id)+"/"

    elif sender == Comments:
        if instance.post_key.open_scope == 1 or (instance.post_key.group and instance.post_key.group.open_scope != 0):
            return
        model_name = 'comment'
        content = instance.comment
        where = instance.post_key.post
        where_owner = instance.post_key.user_key.username
        user = get_object_or_404(User, pk=instance.user_key.id)
        link += str(instance.post_key.id)+"/"

    elif sender == PostEmotions:
        if instance.post_key.open_scope == 1 or (instance.post_key.group and instance.post_key.group.open_scope != 0):
            return
        model_name = 'emotion'
        where = instance.post_key.post
        id_emotion = instance.emotions_ptr_id
        emotion_instance = get_object_or_404(PostEmotions, pk=id_emotion)
        emotion = emotion_instance.emotion
        where_owner = instance.post_key.user_key.username
        user = emotion_instance.user_key
        link += str(instance.post_key.id)+"/"

    log = {'type': model_name, 'user_name': user.username, 'user_id': user.id, 'content': content, 'where': where, 'where_owner': where_owner, 'emotion': emotion, 'link': link}
    r = requests.post('http://localhost:4000/', data=log)

post_save.connect(create_log, sender=Posts)


def create_notification(sender, instance, created, **kwargs):
    noti = None
    relation_user = []

    if sender == Posts:
        _message = instance.user_key.username+"가 '"+instance.post[:10]+"...' 글을 썼습니다"
        _url = "/post/"+str(instance.id)+"/"
        noti = CommonNotification(actor=instance.user_key, message=_message, link=_url)

        # 친구에게 쓰는 글
        if instance.target_user is not None and instance.target_user != instance.user_key:
            relation_user.append(instance.target_user.id)

        # 그룹에 쓰는 글
        elif instance.open_scope == 3:
            members = Memberships.objects.select_related().filter(group_key=instance.group).exclude(user_key=instance.user_key)
            if members.exists():
                members_id = members.values_list('user_key', flat=True)
                relation_user = members_id

    elif sender == Comments:
        _message = instance.user_key.username+"가 '"+instance.post_key.post[:10]+"...' 글에 댓글을 남겼습니다"
        _url = "/post/"+str(instance.post_key.id)+"/"
        noti = CommonNotification(actor=instance.user_key, message=_message, link=_url)

        # 자신을 제외한 댓글을 쓴 사람에게
        commentor = instance.post_key.comments_set.all().exclude(user_key=instance.user_key).values_list('user_key', flat=True)

        # 자신을 제외한 감정을 표현한 사람에게
        emotioner = instance.post_key.postemotions_set.all().exclude(user_key=instance.user_key).values_list('user_key', flat=True)

        # id들을 중복 없이 더하기
        relation_user = (list(set(list(commentor)+list(emotioner))))

        # 글쓴이와 타겟 유저
        if instance.post_key.user_key != instance.user_key and instance.post_key.user_key.id not in relation_user:
            relation_user.append(instance.post_key.user_key.id)
        if instance.post_key.target_user is not None and instance.post_key.target_user != instance.user_key and instance.post_key.target_user.id not in relation_user:
            relation_user.append(instance.post_key.target_user.id)

    elif sender == PostEmotions:
        emotion_str = "좋아합니다" if instance.emotion == "E1" else "멋져합니다"
        _message = instance.user_key.username+"가 '"+instance.post_key.post[:10]+"...' 글에 "+emotion_str
        _url = "/post/"+str(instance.post_key.id)+"/"
        noti = CommonNotification(actor=instance.user_key, message=_message, link=_url)

        # 자신을 제외한 댓글을 쓴 사람에게
        commentor = instance.post_key.comments_set.all().exclude(user_key=instance.user_key).values_list('user_key', flat=True)

        # 자신을 제외한 감정을 표현한 사람에게
        emotioner = instance.post_key.postemotions_set.all().exclude(user_key=instance.user_key).values_list('user_key', flat=True)

        # id들을 중복 없이 더하기
        relation_user = (list(set(list(commentor)+list(emotioner))))

        # 글쓴이와 타겟 유저
        if instance.post_key.user_key != instance.user_key and instance.post_key.user_key.id not in relation_user:
            relation_user.append(instance.post_key.user_key.id)
        if instance.post_key.target_user is not None and instance.post_key.target_user != instance.user_key and instance.post_key.target_user.id not in relation_user:
            relation_user.append(instance.post_key.target_user.id)

    if noti is not None and relation_user.__len__() > 0:
        noti.save()
        for user_id in relation_user:
            user_noti = UserToCommonNotification(target_user_id=user_id, notification=noti)
            user_noti.save()


post_save.connect(create_notification, sender=Posts)


class Comments(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Posts)
    comment = models.CharField(max_length=1024)
    created = models.DateTimeField(auto_now=True)
    updated = models.DateTimeField(auto_now=True)

post_save.connect(create_log, sender=Comments)
post_save.connect(create_notification, sender=Comments)

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

post_save.connect(create_log, sender=PostEmotions)
post_save.connect(create_notification, sender=PostEmotions)


class CommentEmotions(Emotions):
    comment_key = models.ForeignKey(Comments)


class UserPictures(models.Model):
    user_key = models.ForeignKey(User)
    picture = models.CharField(max_length=1000, null=False)
    name = models.CharField(max_length=1000, null=False)
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
    test2 = models.CharField(default='1', max_length='100')


class Approval(models.Model):
    user_key = models.ForeignKey(User)
    friendpost_key = models.ForeignKey(FriendPosts)
    file_link = models.CharField(max_length=1000, null=False)
    file_name = models.CharField(max_length=500, null=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    isChecked = models.NullBooleanField()


class CommonNotification(models.Model):
    actor = models.ForeignKey(User)
    message = models.CharField(max_length=500)
    link = models.CharField(max_length=1000)
    created = models.DateTimeField(auto_now_add=True)


class UserToCommonNotification(models.Model):
    target_user = models.ForeignKey(User)
    notification = models.ForeignKey(CommonNotification)
    is_read = models.BooleanField(default=False)


