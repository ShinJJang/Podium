from django.conf.urls import patterns, include, url
from Maple import views
# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    #url(r'^$', 'Podium.views.home', name='home'),
    # url(r'^Podium/', include('Podium.foo.urls')),
    url(r'^$', views.home),
    # Uncomment the admin/doc line below to enable admin documentation:
    #url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #url(r'^admin/', include(admin.site.urls)),
)
