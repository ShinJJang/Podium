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

class Post(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post = models.CharField(max_length=4096)
    created = models.DateTimeField(auto_now=True)

class Comment(models.Model):
    user_key = models.ForeignKey(User)
    post_key = models.ForeignKey(Post)
    comment = models.CharField(max_length=1024)
    created = models.DateTimeField(auto_now=True)

class Emotion(models.Model):
    LIKE = 'E1'
    GOOD = 'E2'
    EMOTION_CHOICES = (
        (LIKE, 'like'),
        (GOOD, 'good'),
    )
    user_key = models.ForeignKey(UserProfile)
    post_key = models.ForeignKey(Post)
    comment_key = models.ForeignKey(Comment)
    emotion = models.CharField(max_length=2, choices=EMOTION_CHOICES) # default = None?

class Picture(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post_key = models.ForeignKey(Post)
    picture = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

class File(models.Model):
    user_key = models.ForeignKey(UserProfile)
    post_key = models.ForeignKey(Post)
    file = models.FileField(upload_to = 'upload/%y/%m/%d')
    name = models.CharField(max_length=30,null=False)
    created = models.DateTimeField(auto_now=True)

# Relation with friend
class Friendships(models.Model):
    friend_from_user_key = models.ForeignKey(UserProfile, related_name='friend_from')
    friend_to_user_key = models.ForeignKey(UserProfile, related_name='friend_to')

# Relation sending friend request
class PendingFriendships(models.Model):
    request_from_user_key = models.ForeignKey(UserProfile, related_name='request_from')
    request_to_user_key = models.ForeignKey(UserProfile, related_name='request_to')

class UserChats(models.Model):
    chat_from_user_key = models.ForeignKey(User, related_name = 'UserChats_from_user') #chat_user
    chat_to_user_key = models.ForeignKey(User, related_name = 'UserChats_to_user') #chat_with_user
    chat_room_name = models.CharField(max_length=255)

class ChatNoti(models.Model):
    noti_from_user_key = models.ForeignKey(User, related_name = 'ChatNoti_from_user')#from_user
    noti_to_user_key = models.ForeignKey(User, related_name = 'ChatNoti_to_user')#to_user

class ChatComments(models.Model):
    userChat_key = models.ForeignKey(UserChats)
    chat_comment = models.CharField(max_length=255)






