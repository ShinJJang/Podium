from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Posts)
admin.site.register(Comments)
admin.site.register(Notices)
