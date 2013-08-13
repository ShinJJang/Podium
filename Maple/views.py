# Create your views here.
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect

def home(request):
    return render_to_response('index.html')