from django.conf.urls import patterns, include, url
from Maple import views
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()
from tastypie.api import Api
from Maple.api import *
from Maple.forms import RegistrationViewUniqueEmail

v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(UserProfileResource())
v1_api.register(PostResource())
v1_api.register(CommentResource())
v1_api.register(FriendshipNotisResource())
v1_api.register(FriendshipsResource())


urlpatterns = patterns('',
    url(r'^$', views.home),
    url(r'^invite_chat/$', 'Maple.views.invite_chat', name='invite_chat'),
    url(r'^invited_chat/$', 'Maple.views.invited_chat', name='invited_chat'),
    url(r'^chat_comment$', 'Maple.views.chat_comment', name='chat_comment'),
    url(r'^chat/$', 'Maple.views.chat', name='chat'),
    (r'^api/', include(v1_api.urls)),
    url(r'accounts/register/$', RegistrationViewUniqueEmail.as_view(), name='registration_register'),
    (r'^accounts/',include('registration.backends.default.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    #url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
