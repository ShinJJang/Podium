# Create your views here.
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect

from django.template import Context, RequestContext

def home(request):
    variables = Context({
        'page_title': 'Podium'
    })
    return render(request,'index.html',variables)