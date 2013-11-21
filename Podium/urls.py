from django.conf.urls import patterns, include, url
from django.conf import settings
from Maple import views
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()
from tastypie.api import Api
from Maple.api import *
from Maple.forms import RegistrationUniqueView

v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(UserProfileResource())
v1_api.register(PostResource())
v1_api.register(CommentResource())
v1_api.register(FriendshipNotisResource())
v1_api.register(FriendshipsResource())
v1_api.register(FriendPostResource())
v1_api.register(UserPictureResource())
v1_api.register(PostEmotionsResource())
v1_api.register(PollResource())
v1_api.register(GroupResource())
v1_api.register(MembershipsResource())
v1_api.register(MembershipNotisResource())
v1_api.register(UserFilesResource())
v1_api.register(VideoResource())
v1_api.register(ChatRoomResource())
v1_api.register(ChatNotificationResource())
v1_api.register(ChatParticipantsResource())
v1_api.register(UserChattingMessageResource())
v1_api.register(GroupPostResource())
v1_api.register(HighSchoolsResource())
v1_api.register(UserToHighSchoolResource())
v1_api.register(UniversityResource())
v1_api.register(UserToUniversityResource())
v1_api.register(TeamsResource())
v1_api.register(UserToTeamResource())
v1_api.register(CompaniesResource())
v1_api.register(UserToCompanyResource())
v1_api.register(HobbiesResource())
v1_api.register(UserToHobbyResource())
v1_api.register(PLanguagesResource())
v1_api.register(UserToPLanguageResource())
v1_api.register(ApprovalResource())
v1_api.register(CommonNotificationResource())
v1_api.register(UserToNotificationResource())

urlpatterns = patterns('',
    url(r'^$', views.home),
    url(r'^pui/$', views.pui),
    url(r'^people/(?P<people_id>\d+)/$', 'Maple.views.people', name='people'),
    url(r'^post/(?P<post_id>\d+)/$', 'Maple.views.post', name='single_post'),
    url(r'^chat_comment$', 'Maple.views.chat_comment', name='chat_comment'),
    url(r'^chat_list/$', 'Maple.views.get_chat_list', name='get_chat_list'),
    url(r'^set_participant_socket/$', 'Maple.views.set_participant_socket_connection', name='set_participant_socket'),

    url(r'^chat/$', 'Maple.views.chat', name='chat'),
    (r'^api/', include(v1_api.urls)),
    url(r'accounts/register/$', RegistrationUniqueView.as_view(), name='registration_register'),
    (r'^accounts/', include('registration.backends.default.urls')),
    url(r'^vote/$', 'Maple.views.vote', name='vote'),
    # temporary page
    url(r'^sign_s3/$', views.sign_s3),
    url(r'^get_file_count/$', views.get_file_count),
    url(r'^private/$', views.private),
    url(r'^group/(?P<group_id>\d+)/$', 'Maple.views.group', name='group'),
    url(r'^group/(?P<group_id>\d+)/settings/$', 'Maple.views.group_settings', name='group_settings'),
    url(r'^group/(?P<group_id>\d+)/members/$', 'Maple.views.group_members', name='group_members'),
    url(r'^group_create/$', 'Maple.views.group_create', name='group_create'),
    url(r'^search/$', include('haystack.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    #url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'api/doc/', include('tastypie_swagger.urls', namespace='tastypie_swagger')),
)
