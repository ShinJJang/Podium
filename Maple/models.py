from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    created = models.DateTimeField(auto_now=True)
    login_status = models.IntegerField(default=0)

    def __str__(self):
        return  "%s's profile" % self.user

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.objects.get_or_create(user=instance)

post_save.connect(create_user_profile, sender=User)

class Posts(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post = models.CharField(max_length=4096)
    created = models.DateTimeField(auto_now=True)

def create_friend_post(sender, instance, created, **kwargs):
    if created:
        write_user = instance.user_key
        friendships = Friendships.objects.filter(user_key=write_user)
        for friendship in friendships:
             posts, created = FriendPosts.objects.get_or_create(user_key=friendship.friend_user_key, friend_post_key=instance)

post_save.connect(create_friend_post, sender=Posts)

class Comments(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post_key = models.ForeignKey(Posts)
    comment = models.CharField(max_length=1024)
    created = models.DateTimeField(auto_now=True)

class Emotions(models.Model):
    LIKE = 'E1'
    GOOD = 'E2'
    EMOTION_CHOICES = (
        (LIKE, 'like'),
        (GOOD, 'good'),
    )
    user_key = models.ForeignKey(UserProfile)
    emotion = models.CharField(max_length=2, choices=EMOTION_CHOICES) # default = None?

class PostEmotions(Emotions):
    post_key = models.ForeignKey(Posts)

class CommentEmotions(Emotions):
    comment_key = models.ForeignKey(Comments)

class UserPictures(models.Model):
    user_key = models.ForeignKey(UserProfile)
    picture = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

class PostPictures(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post_key = models.ForeignKey(Posts)
    picture = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

class Files(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post_key = models.ForeignKey(Posts)
    file = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

# Relation with friend
class Friendships(models.Model):
    user_key = models.ForeignKey(UserProfile, related_name='my_key')
    friend_user_key = models.ForeignKey(UserProfile, related_name='friend_key')

# Relation sending friend request
class FriendshipNotis(models.Model):
    friend_noti_from_user_key = models.ForeignKey(UserProfile, related_name='request_from')
    friend_noti_to_user_key = models.ForeignKey(UserProfile, related_name='request_to')

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
    # need to add files

class FriendPosts(models.Model):
    user_key = models.ForeignKey(UserProfile, related_name='my_userprofile_key')
    friend_post_key = models.ForeignKey(Posts, related_name='friend_post_key')