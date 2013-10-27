import os
import sys
sys.path.append('/var/django/Podium/Maple')
os.environ['DJANGO_SETTINGS_MODULE'] = 'Podium.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
