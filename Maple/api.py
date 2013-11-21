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
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(User).load_all().filter(Q(username=request.GET.get('q', '')))
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

    def dehydrate(self, bundle):
        bundle.data['user_photo'] = [pic.__dict__ for pic in bundle.obj.userpictures_set.order_by('-created')[:1]]
        return bundle


class HighSchoolsResource(ModelResource):
    class Meta:
        queryset = HighSchools.objects.all()
        resource_name = 'highschools'
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            "id": ['exact'],
            "name": ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(HighSchools).load_all().filter(Q(name=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


class UserToHighSchoolResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=False)
    highschool = fields.ForeignKey(HighSchoolsResource, 'highschool', full=False)

    class Meta:
        queryset = UserToHighSchool.objects.all()
        resource_name = 'user_to_highschool'
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "user": ['exact']
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        highschool = HighSchools.objects.get(pk=bundle.data['highschool'])
        enter = bundle.data['enter']
        graduate = bundle.data['graduate']
        bundle.obj = UserToHighSchool(user=user, highschool=highschool, enter=enter, graduate=graduate)
        bundle.obj.save()
        return bundle


class UniversityResource(ModelResource):
    class Meta:
        queryset = University.objects.all()
        resource_name = 'university'
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            "id": ['exact'],
            "name": ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(University).load_all().filter(Q(name=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


class UserToUniversityResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=False)
    university = fields.ForeignKey(UniversityResource, 'university', full=False)

    class Meta:
        queryset = UserToUniversity.objects.all()
        resource_name = 'user_to_university'
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "user": ['exact']
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        university = University.objects.get(pk=bundle.data['university'])
        enter = bundle.data['enter']
        graduate = bundle.data['graduate']
        major = bundle.data['major']
        bundle.obj = UserToUniversity(user=user, university=university, enter=enter, graduate=graduate, major=major)
        bundle.obj.save()
        return bundle


class TeamsResource(ModelResource):
    class Meta:
        queryset = Teams.objects.all()
        resource_name = 'teams'
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            "id": ['exact'],
            "name": ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(Teams).load_all().filter(Q(name=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


class UserToTeamResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=False)
    team = fields.ForeignKey(TeamsResource, 'team', full=False)

    class Meta:
        queryset = UserToTeam.objects.all()
        resource_name = 'user_to_team'
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "user": ['exact']
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        team = Teams.objects.get(pk=bundle.data['team'])
        joinedOn = bundle.data['joinedOn']
        bundle.obj = UserToTeam(user=user, team=team, joinedOn=joinedOn)
        bundle.obj.save()
        return bundle


class CompaniesResource(ModelResource):
    class Meta:
        queryset = Companies.objects.all()
        resource_name = 'companies'
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            "id": ['exact'],
            "name": ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(Companies).load_all().filter(Q(name=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


class UserToCompanyResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=False)
    company = fields.ForeignKey(CompaniesResource, 'company', full=False)

    class Meta:
        queryset = UserToCompany.objects.all()
        resource_name = 'user_to_company'
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "user": ['exact']
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        company = Companies.objects.get(pk=bundle.data['company'])
        enter = bundle.data['enter']
        leave = bundle.data['leave']
        job = bundle.data['job']
        bundle.obj = UserToCompany(user=user, company=company, enter=enter, leave=leave, job=job)
        bundle.obj.save()
        return bundle


class HobbiesResource(ModelResource):
    class Meta:
        queryset = Hobbies.objects.all()
        resource_name = 'hobbies'
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            "id": ['exact'],
            "name": ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(Hobbies).load_all().filter(Q(name=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


class UserToHobbyResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=False)
    hobby = fields.ForeignKey(HobbiesResource, 'hobby', full=False)

    class Meta:
        queryset = UserToHobby.objects.all()
        resource_name = 'user_to_hobby'
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "user": ['exact']
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        hobby = Hobbies.objects.get(pk=bundle.data['hobby'])
        bundle.obj = UserToHobby(user=user, hobby=hobby)
        bundle.obj.save()
        return bundle


class PLanguagesResource(ModelResource):
    class Meta:
        queryset = PLanguages.objects.all()
        resource_name = 'planguages'
        authorization = Authorization()
        include_resource_uri = False
        always_return_data = True
        filtering = {
            "id": ['exact'],
            "name": ALL
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_user_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(PLanguages).load_all().filter(Q(name=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


class UserToPLanguageResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user', full=False)
    planguage = fields.ForeignKey(PLanguagesResource, 'planguage', full=False)

    class Meta:
        queryset = UserToPLanguage.objects.all()
        resource_name = 'user_to_planguage'
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            "user": ['exact']
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        planguage = PLanguages.objects.get(pk=bundle.data['planguage'])
        bundle.obj = UserToPLanguage(user=user, planguage=planguage)
        bundle.obj.save()
        return bundle


class UserProfileResource(ModelResource):
    user = fields.OneToOneField(UserResource, 'user', full=True)

    class Meta:
        queryset = UserProfile.objects.all()
        resource_name = 'userprofile'
        include_resource_uri = False
        always_return_data = True
        authorization = Authorization()


class UserPictureResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=False)

    class Meta:
        queryset = UserPictures.objects.all()
        resource_name = 'userpictures'
        include_resource_uri = False
        authorization = Authorization()

    def obj_create(self, bundle, **kwargs):
        user_key = bundle.request.user
        file_link = bundle.data['file_link']
        file_name = bundle.data['file_name']
        bundle.obj = UserPictures(user_key=user_key, picture=file_link, name=file_name)
        bundle.obj.save()
        return bundle


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
        if (open_scope == 0) or (open_scope == 1):  # public to self or private
            try:
                target_user = get_object_or_404(User, pk=bundle.data['target'])
            except:
                target_user = user
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType, target_user=target_user)
        elif open_scope == 2:                       # public to friend
            target_user = get_object_or_404(User, pk=bundle.data['target'])
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType,
                               target_user=target_user)
        elif open_scope == 3:                       # group
            group = get_object_or_404(Groups, pk=bundle.data['target'])
            bundle.obj = Posts(user_key=user, post=post, open_scope=open_scope, attachment_type=aType, group=group)

        bundle.obj.save()
        return bundle

    def dehydrate(self, bundle):
        bundle.data['login_user_photo'] = [pic.__dict__ for pic in bundle.request.user.userpictures_set.order_by('-created')[:1]]
        bundle.data['comment_count'] = bundle.obj.comments_set.all().count()
        bundle.data['emotion_e1_count'] = bundle.obj.postemotions_set.filter(emotion="E1").count()
        bundle.data['emotion_e2_count'] = bundle.obj.postemotions_set.filter(emotion="E2").count()
        user_emotion = bundle.obj.postemotions_set.filter(user_key=bundle.request.user)
        bundle.data['emotion_selected'] = user_emotion[0].emotion if user_emotion else None
        if bundle.obj.group and bundle.obj.group.group_name == "사무국" and bundle.obj.attachment_type == 3:
             # 사무국 지원 - 글쓴이가 사무국인지
            writer_membership = Memberships.objects.filter(group_key=bundle.obj.group, user_key=bundle.obj.user_key)
            bundle.data['writer_permission'] = True if writer_membership.exists() and writer_membership[0].permission > 0 else False

            if not bundle.data['writer_permission']:
                return bundle

            # 사무국 지원 - 보는 이가 연수생인지
            membership = Memberships.objects.filter(group_key=bundle.obj.group, user_key=bundle.request.user)
            bundle.data['permission'] = membership[0].permission if membership.exists() else -1

            if bundle.data['permission'] == -1:
                return bundle

            if bundle.data['permission'] == 0:
                approval = FriendPosts.objects.filter(user_key=bundle.request.user, friend_post_key=bundle.obj)[0].approval_set.all()
                if approval.exists():
                    approval = {"id": approval[0].id, "file_link": approval[0].file_link, "file_name": approval[0].file_name}
                    bundle.data['approval'] = approval

            else:
                approvals = Approval.objects.filter(friendpost_key__friend_post_key=bundle.obj.id)
                if approvals.exists():
                    bundle.data['approvals'] = [{"id": obj.id, "file_link": obj.file_link, "file_name": obj.file_name,
                                                 "username": obj.user_key.username, "created": obj.created,
                                                 "updated": obj.updated, "isChecked": obj.isChecked} for obj in approvals]

        return bundle

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_post_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(Posts).load_all().filter(Q(post=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            if result.object.open_scope == 1 or (result.object.group and result.object.group.open_scope != 0):
                continue
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


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

    def dehydrate(self, bundle):
        bundle.data['post_id'] = bundle.obj.post_key.id
        return bundle


class FriendshipNotisResource(ModelResource): #create
    noti_from_user = fields.ForeignKey(UserResource, 'friend_noti_from_user_key', full=True)
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

        if FriendshipNotis.objects.filter(friend_noti_from_user_key=noti_from_user, friend_noti_to_user_key_id=friend_id).exists():
            raise BadRequest('이미 친구 요청을 보냈습니다')

        elif FriendshipNotis.objects.filter(friend_noti_from_user_key_id=friend_id, friend_noti_to_user_key=noti_from_user).exists():
            raise BadRequest('이미 친구 요청을 왔습니다')

        elif Friendships.objects.filter(user_key=noti_from_user, friend_user_key_id=friend_id).exists():
            raise BadRequest("이미 친구입니다")

        bundle.obj = FriendshipNotis(friend_noti_from_user_key=noti_from_user, friend_noti_to_user_key_id=friend_id)
        bundle.obj.save()
        return bundle


class FriendshipsResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key', full=False)
    friend_user = fields.ForeignKey(UserResource, 'friend_user_key', full=True)

    class Meta:
        queryset = Friendships.objects.all()
        resource_name = 'friendship'
        include_resource_uri = False
        authorization = Authorization()
        filtering = {
            "user": ALL_WITH_RELATIONS,
            "friend_user": ALL_WITH_RELATIONS
        }

    def obj_create(self, bundle, **kwargs):
        user = bundle.request.user
        friend_id = bundle.data['friend_id']

        if Friendships.objects.filter(user_key=user, friend_user_key_id=friend_id).exists():
            raise BadRequest("이미 친구입니다")

        bundle.obj = Friendships(user_key=user, friend_user_key_id=friend_id)
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

    def get_list(self, request, **kwargs):
        resp = super(FriendPostResource, self).get_list(request, **kwargs)

        data = json.loads(resp.content)

        for obj in data['objects']:
            if obj['post']['open_scope'] == 1:
                if (obj['post']['target_user'] is not None and request.user.id != obj['post']['target_user']['id']) and request.user.id != obj['post']['user']['id']:
                    data['objects'].remove(obj)

        data = json.dumps(data)

        return HttpResponse(data, mimetype='application/json', status=200)


class PostEmotionsResource(ModelResource):
    user = fields.ForeignKey(UserResource, 'user_key')
    post = fields.ForeignKey(PostResource, 'post_key')

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
            return bundle

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

    def dehydrate(self, bundle):
        user = bundle.request.user
        poll_set = json.loads(bundle.obj.poll)
        user_checked_index = -1
        for index, options in enumerate(poll_set['options']):
            for users in options['users']:
                if users['id'] == user.id:
                    user_checked_index = index

        bundle.data['user_checked'] = user_checked_index
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
        is_project = bundle.data['isProject']
        github_repo = bundle.data['github_repo']
        open_scope = bundle.data['open_scope']
        member_request_list = bundle.data['members']

        if Groups.objects.filter(group_name=group_name).count() != 0:
            raise BadRequest('이미 존재하는 그룹명입니다')

        bundle.obj = Groups(group_name=group_name, description=description, isProject=is_project, github_repo=github_repo, open_scope=open_scope)
        bundle.obj.save()

        # creator is owner
        Memberships.objects.create(group_key=bundle.obj, user_key=bundle.request.user, permission=2)

        # 초대 -> 바로 가입됨
        if member_request_list:
            for user_key in member_request_list:
                user = User.objects.get(id=user_key)
                Memberships.objects.create(group_key=bundle.obj, user_key=user, permission=0)

        return bundle

    def obj_delete(self, bundle, **kwargs):
        obj = self.obj_get(bundle=bundle, **kwargs)
        if obj.memberships_set.all().count() != 0:
            raise BadRequest("멤버가 아직 존재합니다. 해당 그룹을 삭제할 수 없습니다.")

        return super(GroupResource, self).obj_delete(bundle)

    def dehydrate(self, bundle):
        bundle.data['member_count'] = Memberships.objects.filter(group_key=bundle.obj.pk).count()
        return bundle

    def hydrate(self, bundle):  # 업데이트시, 체크
        if bundle.obj.group_name != bundle.data['group_name'] and Groups.objects.filter(group_name=bundle.data['group_name']).count() != 0:
            raise BadRequest('이미 존재하는 그룹명입니다')

        return bundle

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/search%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_search'), name="api_group_get_search"),
        ]

    def get_search(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        # Do the query.
        sqs = SearchQuerySet().models(Groups).load_all().filter(Q(group_name=request.GET.get('q', '')) | Q(description=request.GET.get('q', '')))
        paginator = Paginator(sqs, 20)

        try:
            page = paginator.page(int(request.GET.get('page', 1)))
        except InvalidPage:
            raise Http404("Sorry, no results on that page.")

        objects = []

        for result in page.object_list:
            bundle = self.build_bundle(obj=result.object, request=request)
            bundle = self.full_dehydrate(bundle)
            objects.append(bundle)

        object_list = {
            'objects': objects,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)


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

    def hydrate(self, bundle):  # 멤버 권한 업데이트시, 체크
        request_user_membership = get_object_or_404(Memberships, user_key=bundle.request.user, group_key=bundle.obj.group_key)
        if request_user_membership.permission < 1:
            raise BadRequest('권한이 없습니다.')

        return bundle


class MembershipNotisResource(ModelResource):
    noti_group_key = fields.ForeignKey(GroupResource, 'noti_group_key', full=False)
    noti_user_key = fields.ForeignKey(UserResource, 'noti_user_key', full=True)

    class Meta:
        queryset = MembershipNotis.objects.all()
        resource_name = 'membershipnotis'
        authorization = Authorization()
        filtering = {
            "noti_group_key": ALL_WITH_RELATIONS,
            "noti_user_key": ALL_WITH_RELATIONS
        }
        always_return_data = True

    def obj_create(self, bundle, **kwargs):

        #group = Groups.objects.get(pk=bundle.data['noti_group_key'])
        #user = User.objects.get(pk=bundle.data['noti_user_key'])
        group_id = bundle.data['noti_group_key']
        user_id = bundle.data['noti_user_key']

        if MembershipNotis.objects.filter(noti_group_key_id=group_id, noti_user_key_id=user_id).exists():
            raise BadRequest('이미 그룹 가입 요청이 되었습니다.')

        elif Memberships.objects.filter(group_key=group_id, user_key=user_id).exists():
            raise BadRequest("이미 존재하는 멤버입니다.")  # TODO - 400 이용하면 그룹 요청시 요긴할 것 - JS 수정

        bundle.obj = MembershipNotis(noti_group_key_id=group_id, noti_user_key_id=user_id)
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
            room_name = ""
            room = bundle.obj
            ChatParticipants.objects.create(chat_room_key=room, user_key=request_user) #트루일때 소켓연결햇다는 것
            for participant in participants:
                append_user = User.objects.get(id=participant)
                print append_user.id
                room_name = room_name + append_user.username + ","
                ChatParticipants.objects.create(chat_room_key=room, user_key=append_user)
            room_name = room_name + request_user.username
            bundle.obj.chat_room_name = room_name
            bundle.obj.save()
            return bundle


class ChatNotificationResource(ModelResource):
    chat_room_key = fields.ForeignKey(ChatRoomResource, 'chat_room_key', full=True)
    from_user_key = fields.ForeignKey(UserResource, 'from_user_key', full=False)
    to_user_key = fields.ForeignKey(UserResource, 'to_user_key', full=True)

    class Meta:
        queryset = ChatNotification.objects.all()
        resource_name = 'chat_notis'
        authorization = Authorization()
        filtering = {
            "chat_room_key": ALL_WITH_RELATIONS,
            "from_user_key": ALL_WITH_RELATIONS,
            "to_user_key": ALL_WITH_RELATIONS
        }


class ChatParticipantsResource(ModelResource):
    chat_room_key = fields.ForeignKey(ChatRoomResource, 'chat_room_key', full=False)
    user = fields.ForeignKey(UserResource, 'user_key', full=True)

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
    user = fields.ForeignKey(UserResource, 'user_key', full=True)

    class Meta:
        queryset = UserChattingMessage.objects.all().order_by("-created")
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
        bundle.obj = UserChattingMessage.objects.create(chat_room_key=chat_room_key, user_key=user_key, chatting_message=message)
        bundle.obj.save()
        return bundle


class GroupPostResource(ModelResource):
    group = fields.ForeignKey(UserResource, 'group_key', full=False)
    post = fields.ForeignKey(PostResource, 'post_key', full=True)

    class Meta:
        queryset = GroupPosts.objects.all().order_by('-pk')
        resource_name = 'groupposts'
        include_resource_uri = False
        authorization = Authorization()
        filtering = {
            "id": ['exact', 'gt', 'lte'],
            "group": ALL_WITH_RELATIONS,
            "post": ALL_WITH_RELATIONS,
        }
        # paginator_class = EstimatedCountPaginator
        allowed_methods = ['get']

    def dehydrate(self, bundle):
        friendpost = FriendPosts.objects.filter(user_key=bundle.request.user, friend_post_key=bundle.obj.post_key)
        if friendpost.exists():
            bundle.data['friend_post_key'] = friendpost[0].id
        else:
            bundle.data['friend_post_key'] = -1

        return bundle


class ApprovalResource(ModelResource):
    user_key = fields.ForeignKey(UserResource, 'user_key', full=True)
    friend_post_key = fields.ForeignKey(FriendPostResource, 'friendpost_key', full=False)

    class Meta:
        queryset = Approval.objects.all().order_by('-pk')
        resource_name = 'approvals'
        always_return_data = True
        authorization = Authorization()
        filtering = {
            "user_key": ALL,
            "friend_post_key": ALL
        }

    def obj_create(self, bundle, **kwargs):
        post_friend_key = bundle.data['post_friend_key']
        user_key = bundle.request.user
        file_link = bundle.data['file_link']
        file_name = bundle.data['file_name']

        if Approval.objects.filter(user_key=user_key, friendpost_key_id=post_friend_key).exists():
            raise BadRequest("이미 제출되었습니다")

        bundle.obj = Approval.objects.create(user_key=user_key, friendpost_key_id=post_friend_key, file_link=file_link, file_name=file_name)

        return bundle

    def hydrate(self, bundle):
        request_member = Memberships.objects.filter(group_key__group_name="사무국", user_key=bundle.request.user)
        if request_member.exists() and request_member[0].permission < 1 and bundle.obj.isChecked:
            raise BadRequest("이미 승인되어 수정이 불가능합니다")
        return bundle


class CommonNotificationResource(ModelResource):
    actor = fields.ForeignKey(UserResource, 'actor', full=True)

    class Meta:
        queryset = CommonNotification.objects.all().order_by('-pk')
        resource_name = 'commonnoti'
        always_return_data = True
        authorization = Authorization()
        filtering = {
            "actor": ALL_WITH_RELATIONS,
        }


class UserToNotificationResource(ModelResource):
    target_user = fields.ForeignKey(UserResource, 'target_user', full=True)
    notification = fields.ForeignKey(FriendPostResource, 'notification', full=True)

    class Meta:
        queryset = UserToCommonNotification.objects.all().order_by('-pk')
        resource_name = 'usernoti'
        always_return_data = True
        authorization = Authorization()
        filtering = {
            "target_user": ALL_WITH_RELATIONS,
            "notification": ALL_WITH_RELATIONS
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/count%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('get_count'), name="api_user_noti_count"),
        ]

    def get_count(self, request, **kwargs):
        user = request.user

        unread_notis_count = UserToCommonNotification.objects.filter(target_user=user, is_read=False).count()
        object_list = {
            'noti_count': unread_notis_count,
        }

        self.log_throttled_access(request)
        return self.create_response(request, object_list)

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
