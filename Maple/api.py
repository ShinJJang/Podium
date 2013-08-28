# RESTful API controller
# tastypie framework using
from django.contrib.auth.models import User
from .models import *
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
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
    user = fields.ToOneField(UserProfileResource, 'user_key', full=True)

    class Meta:
        queryset = Posts.objects.all()
        resource_name = 'post'
        include_resource_uri = False
        authorization= Authorization()
        filtering = {
            "user": ALL_WITH_RELATIONS,
            "post": ALL,
        }
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        userprofile = UserProfile.objects.get(user=bundle.request.user)
        post = bundle.data['post']
        bundle.obj = Posts(user_key=userprofile, post=post)
        bundle.obj.save()
        return bundle

class CommentResource(ModelResource):
    user = fields.ForeignKey(UserProfileResource, 'user_key', full=False)
    post = fields.ForeignKey(PostResource, 'post_key', full=False)

    class Meta:
        queryset = Comments.objects.all()
        resource_name = 'comment'
        include_resource_uri = False
        authorization= Authorization()
        filtering = {
            "user": ALL_WITH_RELATIONS,
            "post": ALL_WITH_RELATIONS,
        }

    def obj_create(self, bundle, **kwargs):
        user = User.objects.get(pk=bundle.request.user.id)
        post = Posts.objects.get(pk=1)
        comment = bundle.data['comment']
        bundle.obj = Comments(user_key=user, post_key=post, comment=comment)
        bundle.obj.save()
        return bundle

#class FriendshipNotisResource(ModelResource):

#class FriendshipsResource(ModelResource):


"""
detail_uri_kwargs()
get_object_list()
obj_get_list()
obj_get()
obj_create()
obj_update()
obj_delete_list()
obj_delete()
rollback()
"""