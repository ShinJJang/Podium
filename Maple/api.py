# RESTful API controller
# tastypie framework using
from django.contrib.auth.models import User
from .models import *
from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.authentication import BasicAuthentication
from tastypie.authorization import DjangoAuthorization

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'auth/user'
        fields = ['email', 'username', 'last_login']
        authentication = BasicAuthentication()

class UserProfileResource(ModelResource):
    user = fields.OneToOneField(UserResource, 'user', full=True)

    class Meta:
        queryset = UserProfile.objects.all()
        resource_name = 'userprofile'
        authorization = DjangoAuthorization()

class PostResource(ModelResource):
    user_key = fields.ToOneField(UserProfileResource, 'user_key', full=True)

    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'
        authorization = DjangoAuthorization()