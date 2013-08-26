# RESTful API controller
# tastypie framework using
from django.contrib.auth.models import User
from .models import *
from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.authentication import BasicAuthentication
from tastypie.authorization import DjangoAuthorization, Authorization

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        fields = ['email', 'username', 'last_login']
        authorization= Authorization()

class UserProfileResource(ModelResource):
    user = fields.OneToOneField(UserResource, 'user', full=True)

    class Meta:
        queryset = UserProfile.objects.all()
        resource_name = 'userprofile'
        include_resource_uri = False
        authorization= Authorization()

class PostResource(ModelResource):
    user_key = fields.ToOneField(UserProfileResource, 'user_key', full=True)

    class Meta:
        queryset = Post.objects.all()
        resource_name = 'post'
        include_resource_uri = False
        authorization= Authorization()

    def obj_create(self, bundle, **kwargs):
        userprofile = UserProfile.objects.get(user=bundle.request.user)
        post = bundle.data['post']
        bundle.obj = Post(user_key=userprofile, post=post)
        bundle.obj.save()
        return bundle

class CommentResource(ModelResource):
    user_key = fields.ToOneField(UserProfileResource, 'user_key', full=False)
    post_key = fields.ToOneField(PostResource, 'post_key', full=False)

    class Meta:
        queryset = Comment.objects.all()
        resource_name = 'comment'
        include_resource_uri = False
        authorization= Authorization()

    def obj_create(self, bundle, **kwargs):
        user = User.objects.get(pk=bundle.request.user.id)
        post = Post.objects.get(pk=1)
        comment = bundle.data['comment']
        bundle.obj = Comment(user_key=user, post_key=post, comment=comment)
        bundle.obj.save()
        return bundle


