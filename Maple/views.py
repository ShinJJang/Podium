# Create your views here.
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect

from django.template import Context, RequestContext

def home(request):
    return render_to_response('index.html', {'page_title': 'Podium'}, RequestContext(request))