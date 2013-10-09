# -*- coding: utf-8 -*-
# RESTful API controller
# tastypie framework using
from django.contrib.auth.models import User
from .models import *
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.authentication import BasicAuthentication
from tastypie.authorization import DjangoAuthorization, Authorization
from .paginator import EstimatedCountPaginator

import json

import logging
l = logging.getLogger('django.db.backends')
l.setLevel(logging.DEBUG)
l.addHandler(logging.StreamHandler())

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        fields = ['id', 'email', 'username', 'last_login']
        authorization= Authorization()
        include_resource_uri = False
        filtering = {
            "id": ['exact']
        }

class UserProfileResource(ModelResource):
    user = fields.OneToOneField(UserResource, 'user', full=True)

    class Meta:
        queryset = UserProfile.objects.all()
        resource_name = 'userprofile'
        include_resource_uri = False
        authorization= Authorization()

class UserPictureResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=False)

    class Meta:
        queryset = UserPictures.objects.all()
        resource_name = 'userpictures'
        include_resource_uri = False
        authorization= Authorization()

class PostResource(ModelResource):
    user = fields.ToOneField(UserResource, 'user_key', full=True)
    target_user = fields.ToOneField(UserResource, 'target_user', full=True, null=True)
    group = fields.ToOneField('Maple.api.GroupResource', 'group', full=True, null=True)

    class Meta:
        queryset = Posts.objects.all()
        resource_name = 'post'
        include_resource_uri = False
        authorization= Authorization()
        filtering = {
            "user": ALL_WITH_RELATIONS,
            "post": ALL,
            "target_user": ALL_WITH_RELATIONS,
            "group": ALL_WITH_RELATIONS,
            "open_scope": ALL
        }
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        post = bundle.data['post']
        open_scope = bundle.data['open_scope']
        aType = bundle.data['aType']
        if(open_scope == 0) or (open_scope == 1): # public to self or private
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType)
        elif(open_scope == 2): # public to friend
            target_user = User.objects.get(pk= bundle.data['target'])
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType, target_user=target_user)
        elif(open_scope == 3): # group
            group = Groups.objects.get(pk= bundle.data['target'])
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType, group=group)

        bundle.obj.save()
        return bundle

    def dehydrate(self, bundle):
        bundle.data['test'] = Posts.objects.filter(comments__pk=1)[0] # will delete
        bundle.data['comment_count'] = bundle.obj.comments_set.all().count()
        bundle.data['emotion_count'] = bundle.obj.postemotions_set.all().count()
        if(bundle.obj.group):
            bundle.data['group_name'] = bundle.obj.group.group_name
            bundle.data['group_id'] = bundle.obj.group.id
        elif(bundle.obj.target_user):
            bundle.data['target_user_name'] = bundle.obj.target_user.username
            bundle.data['target_user_id'] = bundle.obj.target_user.id
        return bundle

class CommentResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=True)
    post = fields.ForeignKey(PostResource, 'post_key', full=False)

    class Meta:
        queryset = Comments.objects.all()
        resource_name = 'comment'
        include_resource_uri = False
        authorization= Authorization()
        filtering = {
            "id": ['gt'],
            "user": ALL_WITH_RELATIONS,
            "post": ALL_WITH_RELATIONS,
        }
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        post_key = bundle.data['post_key']
        post = Posts.objects.get(pk=post_key)
        comment = bundle.data['comment']
        bundle.obj = Comments(user_key=user, post_key=post, comment=comment)
        bundle.obj.save()
        return bundle

class FriendshipNotisResource(ModelResource): #create
    noti_from_user = fields.ForeignKey(UserResource, 'friend_noti_from_user_key', full=False)
    noti_to_user = fields.ForeignKey(UserResource, 'friend_noti_to_user_key', full=False)

    class Meta:
        queryset = FriendshipNotis.objects.all()
        resource_name = 'friend_noti'
        include_resource_uri = False
        authorization = Authorization()
        filtering = {
            "noti_to_user": ALL_WITH_RELATIONS,
            "noti_from_user": ALL_WITH_RELATIONS
        }

    def obj_create(self, bundle, **kwargs):
        noti_from_user = bundle.request.user
        friend_id = bundle.data['friend_id']
        noti_to_user = User.objects.get(pk = friend_id)
        bundle.obj = FriendshipNotis(friend_noti_from_user_key = noti_from_user, friend_noti_to_user_key = noti_to_user)
        bundle.obj.save()
        return bundle

class FriendshipsResource(ModelResource): #polling get or create
    user = fields.ForeignKey(UserResource, 'user_key', full=False)
    friend_user = fields.ForeignKey(UserResource, 'friend_user_key', full=False)

    class Meta:
        queryset = Friendships.objects.all()
        resource_name = 'friendship'
        include_resource_uri = False
        authorization= Authorization()
        filtering = {
            "user": ALL_WITH_RELATIONS,
            "friend_user": ALL_WITH_RELATIONS,
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        friend_id = bundle.data['friend_id']
        friend_user = User.objects.get(pk = friend_id)
        bundle.obj = Friendships(user_key = user, friend_user_key = friend_user)
        bundle.obj.save()
        return bundle

class FriendPostResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=True)
    post = fields.ForeignKey(PostResource, 'friend_post_key', full=True)

    class Meta:
        queryset = FriendPosts.objects.all().order_by('-pk')
        resource_name = 'friendposts'
        include_resource_uri = False
        authorization= Authorization()
        filtering = {
            "id": ['exact', 'gt', 'lte'],
            "user": ALL_WITH_RELATIONS,
            "post": ALL_WITH_RELATIONS,
        }
        # paginator_class = EstimatedCountPaginator
        allowed_methods = ['get']

class PostEmotionsResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user')
    post = fields.ForeignKey(PostResource, 'post')

    class Meta:
        queryset = PostEmotions.objects.all()
        resource_name = 'postemotions'
        authorization= Authorization()
        filtering = {
            "user": ALL_WITH_RELATIONS,
            "post": ALL_WITH_RELATIONS,
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        post = Posts.objects.get(pk=bundle.data['post_key'])
        emotion = bundle.data['emotion']

        # 이미 감정표현을 한 경우.
        if PostEmotions.objects.filter(user_key=user, post_key=post).exists():
            return bundle;

        bundle.obj = PostEmotions(user_key = user, post_key = post, emotion = emotion)
        bundle.obj.save()
        return bundle

class PollResource(ModelResource):
    post = fields.ForeignKey(PostResource, 'post_key', full=False)

    class Meta:
        queryset = Polls.objects.all()
        resource_name = 'polls'
        authorization= Authorization()
        filtering = {
            "post": ALL_WITH_RELATIONS,
        }

    def obj_create(self, bundle, **kwargs):
        post_key = bundle.data['post_key']
        post = Posts.objects.get(pk=post_key)
        poll = bundle.data['poll']
        bundle.obj = Polls(post_key=post, poll=poll)
        bundle.obj.save()
        return bundle

class GroupResource(ModelResource):

    class Meta:
        queryset = Groups.objects.all()
        resource_name = 'groups'
        authorization = Authorization()
        filtering = {
            "id": ALL
        }

"""
// tastypie 상속 가능한 method
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
