# -*- coding: utf-8 -*-
# RESTful API controller
# tastypie framework using
from django.db.models import Q
from django.contrib.auth.models import User
from .models import *
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.exceptions import HttpResponse, BadRequest
from tastypie.authentication import BasicAuthentication
from tastypie.authorization import DjangoAuthorization, Authorization
from .paginator import EstimatedCountPaginator

import json
import operator

import logging
#l = logging.getLogger('django.db.backends')
#l.setLevel(logging.DEBUG)
#l.addHandler(logging.StreamHandler())

from django.conf.urls import *
from tastypie.utils import trailing_slash
from haystack.query import SearchQuerySet
from django.core.paginator import Paginator, InvalidPage
from django.http import Http404
from tastypie.exceptions import BadRequest

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        fields = ['id', 'email', 'username', 'last_login']
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "id": ['exact']
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        #sqs = SearchQuerySet().models(User).load_all().auto_query(request.GET.get('q', ''))
        sqs = SearchQuerySet().models(User).load_all().autocomplete(username=request.GET.get('q', ''))
        #sqs = SearchQuerySet().models(User).filter(username__contain=request.GET.get('q', ''))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            if result.object == bundle.request.user:
                continue
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)

class UserProfileResource(ModelResource):
    user = fields.OneToOneField(UserResource, 'user', full=True)

    class Meta:
        queryset = UserProfile.objects.all()
        resource_name = 'userprofile'
        include_resource_uri = False
        authorization = Authorization()


class UserPictureResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=False)

    class Meta:
        queryset = UserPictures.objects.all()
        resource_name = 'userpictures'
        include_resource_uri = False
        authorization = Authorization()


class PostResource(ModelResource):
    user = fields.ToOneField(UserResource, 'user_key', full=True)
    target_user = fields.ToOneField(UserResource, 'target_user', full=True, null=True)
    group = fields.ToOneField('Maple.api.GroupResource', 'group', full=True, null=True)

    class Meta:
        queryset = Posts.objects.all()
        resource_name = 'post'
        include_resource_uri = False
        authorization = Authorization()
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
        if (open_scope == 0) or (open_scope == 1): # public to self or private
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType)
        elif (open_scope == 2): # public to friend
            target_user = User.objects.get(pk=bundle.data['target'])
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType,
                               target_user=target_user)
        elif (open_scope == 3): # group
            group = Groups.objects.get(pk=bundle.data['target'])
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType, group=group)

        bundle.obj.save()
        return bundle

    def dehydrate(self, bundle):
        bundle.data['comment_count'] = bundle.obj.comments_set.all().count()
        bundle.data['emotion_count'] = bundle.obj.postemotions_set.all().count()
        if (bundle.obj.group):
            bundle.data['group_name'] = bundle.obj.group.group_name
            bundle.data['group_id'] = bundle.obj.group.id
        elif (bundle.obj.target_user):
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
        authorization = Authorization()
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
        noti_to_user = User.objects.get(pk=friend_id)
        bundle.obj = FriendshipNotis(friend_noti_from_user_key=noti_from_user, friend_noti_to_user_key=noti_to_user)
        bundle.obj.save()
        return bundle


class FriendshipsResource(ModelResource): #polling get or create
    user = fields.ForeignKey(UserResource, 'user_key', full=False)
    friend_user = fields.ForeignKey(UserResource, 'friend_user_key', full=False)

    class Meta:
        queryset = Friendships.objects.all()
        resource_name = 'friendship'
        include_resource_uri = False
        authorization = Authorization()
        filtering = {
            "user_key": ALL_WITH_RELATIONS,
            "friend_user": ALL_WITH_RELATIONS
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        friend_id = bundle.data['friend_id']
        friend_user = User.objects.get(pk=friend_id)
        bundle.obj = Friendships(user_key=user, friend_user_key=friend_user)
        bundle.obj.save()
        return bundle


class FriendPostResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=True)
    post = fields.ForeignKey(PostResource, 'friend_post_key', full=True)

    class Meta:
        queryset = FriendPosts.objects.all().order_by('-pk')
        resource_name = 'friendposts'
        include_resource_uri = False
        authorization = Authorization()
        filtering = {
            "id": ['exact', 'gt', 'lte'],
            "user": ALL_WITH_RELATIONS,
            "post": ALL_WITH_RELATIONS,
        }
        # paginator_class = EstimatedCountPaginator
        allowed_methods = ['get']

    def dehydrate(self, bundle):
        bundle.data['user_photo'] = [pic.__dict__ for pic in bundle.obj.user_key.userpictures_set.order_by('-created')[:1]]
        return bundle


class PostEmotionsResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user')
    post = fields.ForeignKey(PostResource, 'post')

    class Meta:
        queryset = PostEmotions.objects.all()
        resource_name = 'postemotions'
        authorization = Authorization()
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

        bundle.obj = PostEmotions(user_key=user, post_key=post, emotion=emotion)
        bundle.obj.save()
        return bundle


class PollResource(ModelResource):
    post = fields.ForeignKey(PostResource, 'post_key', full=False)

    class Meta:
        queryset = Polls.objects.all()
        allowed_methods = ('get', 'post', 'put', 'delete', 'patch')
        list_allowed_methods = ['get', 'post','put', 'delete', 'patch']
        resource_name = 'polls'
        authorization = Authorization()
        filtering = {
            "post": ALL_WITH_RELATIONS
        }

    def obj_create(self, bundle, **kwargs):
        post_key = bundle.data['post_key']
        post = Posts.objects.get(pk=post_key)
        poll = bundle.data['poll']
        bundle.obj = Polls(post_key=post, poll=poll)
        bundle.obj.save()
        return bundle

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<post_key>\w[\w/-]*)/vote%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('vote'), name="api_vote"),
        ]

    def vote(self, bundle, **kwargs):
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
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        group_name = bundle.data['group_name']
        description = bundle.data['description']
        is_project = bundle.data['is_project']
        open_scope = bundle.data['open_scope']
        member_request_list = bundle.data['members']
        if Groups.objects.filter(group_name=group_name).count() != 0:
            raise BadRequest('이미 존재하는 그룹명입니다')
        bundle.obj = Groups(group_name=group_name, description=description, isProject=is_project, open_scope=open_scope)
        bundle.obj.save()
        # creator is owner
        Memberships.objects.create(group_key=bundle.obj, user_key=bundle.request.user, permission=2)
        # 초대 -> 바로 가입됨
        if member_request_list:
            for user_key in member_request_list:
                user = User.objects.get(id=user_key)
                Memberships.objects.create(group_key=bundle.obj, user_key=user, permission=0)

        return bundle

    def hydrate(self, bundle):  # 업데이트시, 체크
        if bundle.obj.group_name != bundle.data['group_name'] and Groups.objects.filter(group_name=bundle.data['group_name']).count() != 0:
            raise BadRequest('이미 존재하는 그룹명입니다')

        return bundle

class MembershipsResource(ModelResource):
    group_key = fields.ForeignKey(GroupResource, 'group_key', full=True)
    user_key = fields.ForeignKey(UserResource, 'user_key', full=True)

    class Meta:
        queryset = Memberships.objects.all()
        resource_name = 'memberships'
        authorization = Authorization()
        filtering = {
            "group_key": ALL_WITH_RELATIONS,
            "user_key": ALL_WITH_RELATIONS
        }
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        group = Groups.objects.get(pk=bundle.data['group_key'])
        user = User.objects.get(pk=bundle.data['user_key'])

        if Memberships.objects.filter(group_key=group, user_key=user).exists():
            raise BadRequest("이미 존재하는 멤버입니다.")

        bundle.obj = Memberships(group_key=group, user_key=user)
        bundle.obj.save()
        return bundle

class MembershipNotisResource(ModelResource):
    noti_group_key = fields.ForeignKey(GroupResource, 'noti_group_key', full=False)
    noti_user_key = fields.ForeignKey(UserResource, 'noti_user_key', full=True)

    class Meta:
        queryset = MembershipNotis.objects.all()
        resource_name = 'membershipnotis'
        authorization = DjangoAuthorization()
        filtering = {
            "noti_group_key": ALL_WITH_RELATIONS,
            "noti_user_key": ALL_WITH_RELATIONS
        }
        always_return_data = True

    def obj_create(self, bundle, **kwargs):
        group = Groups.objects.get(pk=bundle.data['noti_group_key'])
        user = User.objects.get(pk=bundle.data['noti_user_key'])

        if Memberships.objects.filter(group_key=group, user_key=user).exists():
            raise BadRequest("이미 존재하는 멤버입니다.")  # TODO - 400 이용하면 그룹 요청시 요긴할 것 - JS 수정

        bundle.obj = MembershipNotis(noti_group_key=group, noti_user_key=user)
        bundle.obj.save()
        return bundle

    # TODO - API GET 그룹 가입 요청, 권한 처리
   #def obj_get_list(self, bundle, **kwargs):
    #    user = bundle.request.user
    #    group = Groups.objects.get(id=bundle.data['noti_group_key'])
    #    request_user_membership = Memberships.objects.get(group_key=group, user_key=user)
    #
    #    if request_user_membership.permission != 0:
    #        return super(MembershipNotisResource, self).obj_get_list()
    #    else:
    #        raise BadRequest('Request user is not permitted to get membership Notification in this group.')

class UserFilesResource(ModelResource):
    post = fields.ForeignKey(PostResource, 'post_key', full=False)

    class Meta:
        queryset = UserFiles.objects.all()
        resource_name = 'user_files'
        authorization = Authorization()
        filtering = {
            "post": ALL
        }

    def obj_create(self, bundle, **kwargs):
        print "test "
        post_key = bundle.data['post_key']
        post = Posts.objects.get(pk=post_key)
        user_key = bundle.request.user
        file_type = bundle.data['file_type']
        file_link = bundle.data['file_link']
        file_name = bundle.data['file_name']
        bundle.obj = UserFiles(post_key=post, user_key=user_key, file_link=file_link, file_type=file_type, file_name=file_name)
        bundle.obj.save()
        user_file_count = UserFileCount.objects.get(user_key=user_key)
        user_file_count.file_count = user_file_count.file_count + 1
        user_file_count.save()
        return bundle


class VideoResource(ModelResource):
    post = fields.ForeignKey(PostResource, 'post_key', full=False)

    class Meta:
        queryset = Videos.objects.all()
        resource_name = 'videos'
        authorization = Authorization()
        filtering = {
            "post": ALL_WITH_RELATIONS,
        }

    def obj_create(self, bundle, **kwargs):
        post_key = bundle.data['post_id']
        post = Posts.objects.get(pk=post_key)
        video = bundle.data['video']
        bundle.obj = Videos(post_key=post, video=video)
        bundle.obj.save()
        return bundle

class ChatRoomResource(ModelResource):

    class Meta:
        queryset = ChatRoom.objects.all()
        resource_name = 'chat_room'
        authorization = Authorization()
        filtering = {
            "id": ALL
        }
        always_return_data = True

    def obj_get_list(self, bundle, **kwargs):
        print "test get"
        user_key = bundle.request.user.id

        print bundle

        chat_rooms = ChatRoom.objects.filter(chatparticipants__user_key=user_key).distinct()
        return chat_rooms

    def obj_create(self, bundle, **kwargs): #채팅룸이 없으면 만들어지고 있으면 해당 룸 정보 리턴
        print "test post method"
        request_user = bundle.request.user
        participants = bundle.data['participants']
        participants_count = bundle.data['participants_count']
        print "test for search room1"
        chat_room = ChatRoom.objects.filter(chatparticipants__user_key=request_user).distinct().filter(participant_count=participants_count)
        for participant in participants:
            chat_room = chat_room.filter(chatparticipants__user_key=User.objects.get(id=participant))
        print chat_room
        if chat_room:
            bundle.obj = ChatRoom.objects.get(pk=chat_room)
            bundle.obj.save()
            print bundle.obj.participant_count
            return bundle
        else:
            bundle.obj = ChatRoom.objects.create(chat_room_name="default", participant_count=participants_count)
            bundle.obj.save()
            room = bundle.obj
            ChatParticipants.objects.create(chat_room_key=room, user_key=request_user) #트루일때 소켓연결햇다는 것
            for participant in participants:
                append_user = User.objects.get(id=participant)
                print append_user.id
                ChatParticipants.objects.create(chat_room_key=room, user_key=append_user)
            return bundle

class ChatNotificationResource(ModelResource):
    chat_room = fields.ForeignKey(ChatRoomResource, 'chat_room', full=False)

    class Meta:
        queryset = UserFiles.objects.all()
        resource_name = 'chat_notis'
        authorization = Authorization()
        filtering = {
            "chat_room": ALL
        }


class ChatParticipantsResource(ModelResource):
    chat_room_key = fields.ForeignKey(ChatRoomResource, 'chat_room_key', full=False)
    user = fields.ForeignKey(UserResource, 'user_key', full=False)

    class Meta:
        queryset = ChatParticipants.objects.all()
        resource_name = 'chat_participants'
        authorization = Authorization()
        filtering = {
            "chat_room_key": ALL,
            "user": ALL
        }


class UserChattingMessageResource(ModelResource):
    chat_room_key = fields.ForeignKey(ChatRoomResource, 'chat_room_key', full=False)
    user = fields.ForeignKey(UserResource, 'user_key', full=False)

    class Meta:
        queryset = UserChattingMessage.objects.all()
        resource_name = 'user_chat_message'
        authorization = Authorization()
        filtering = {
            "chat_room_key": ALL,
            "user": ALL
        }

    def obj_create(self, bundle, **kwargs):
        message = bundle.data['comment']
        user_id = bundle.data['user_id']
        room_id = bundle.data['room_id']
        chat_room_key = ChatRoom.objects.get(id=room_id)
        user_key = User.objects.get(id=user_id)
        bundle.obj = UserChattingMessage.objects.create(chat_room_key=chat_room_key, user_key=user_key,chatting_message=message)
        bundle.obj.save()
        return bundle




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
