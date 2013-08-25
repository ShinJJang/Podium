from django.conf.urls import patterns, include, url
from Maple import views
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()
from tastypie.api import Api
from Maple.api import UserResource, UserProfileResource, PostResource

v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(UserProfileResource())
v1_api.register(PostResource())

urlpatterns = patterns('',
    url(r'^$', views.WritePost.as_view(), name='post_write'),
    (r'^api/', include(v1_api.urls)),
    (r'^accounts/',include('registration.backends.default.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    #url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
