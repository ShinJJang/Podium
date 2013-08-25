from django.conf.urls import patterns, include, url
from Maple import views
# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    #url(r'^$', 'Podium.views.home', name='home'),
    # url(r'^Podium/', include('Podium.foo.urls')),
    url(r'^$', views.WritePost.as_view(), name='post_write'),
    (r'^register/$', views.register),
    (r'^login/$', 'django.contrib.auth.views.login'),
    url(r'^invite_chat/$', 'Maple.views.invite_chat', name='invite_chat'),
    url(r'^invited_chat/$', 'Maple.views.invited_chat', name='invited_chat'),
    url(r'^chat_comment$', 'Maple.views.chat_comment', name='chat_comment'),
    url(r'^chat/$', 'Maple.views.chat', name='chat'),
    # Uncomment the admin/doc line below to enable admin documentation:
    #url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #url(r'^admin/', include(admin.site.urls)),
)
