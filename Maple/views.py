# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response, render
from django.shortcuts import redirect
from django.http import HttpResponse, HttpResponseServerError, HttpResponseRedirect

from django.template import Context, RequestContext
from django.views.generic.edit import CreateView
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session

from .models import UserProfile, Post, ChatNoti, ChatComments, UserChats
from .forms import PostForm, PostWriteForm
from django.utils import timezone

@login_required
def home(request):
    users = User.objects.select_related().all()[0:100]
    return render_to_response('index.html', {'page_title': 'Podium'}, RequestContext(request))

def chat(request):
    users = User.objects.select_related().all()[0:100]
    ctx = Context({
                        'users':users
        })
    return render_to_response('chat_index.html', ctx)

class WritePost(CreateView):
    model = PostForm
    form_class = PostWriteForm
    success_url = '/'
    template_name = 'index.html'

    def form_valid(self, form):
        user = self.request.user.id
        instance = form.save(commit=False)
        instance.created = timezone.now()
        instance.user_key = UserProfile.objects.get(user_id=user)
        return super(WritePost, self).form_valid(form)

@login_required
def invite_chat(request):
    invite_people = request.GET.get("chating_user", "")
    print "chating_user = " + invite_people
    session = Session.objects.get(session_key = request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    chating_user = User.objects.get(id = invite_people)
    ChatNoti.objects.create(noti_from_user_key = user, noti_to_user_key = chating_user)

    try: #이미 만들어져있는 채팅방이 있는지를 조회
        chat_info = UserChats.objects.get(chat_to_user_key = user, chat_from_user_key = chating_user)
        chat_comments = ChatComments.objects.filter(userChat_key = chat_info)
        ctx = Context({
                        'user':user,
                        'chat_info':chat_info,
                        'chat_comments':chat_comments
        })
        return render_to_response('chat.html', ctx)
    except:
        try:
            chat_info = UserChats.objects.get(chat_to_user_key = chating_user, chat_from_user_key = user)
            chat_comments = ChatComments.objects.filter(userChat_key = chat_info)
            ctx = Context({
                        'chat_info':chat_info,
                        'user':user,
                        'chat_comments':chat_comments
            })
            return render_to_response('chat.html', ctx)
        except:
            chat_info = UserChats.objects.create(chat_to_user_key = chating_user, chat_from_user_key = user, chat_room_name = str(user.id) + "to" + str(chating_user.id))
            chat_comments = ChatComments.objects.create(userChat_key = chat_info, chat_comment = "null")
            ctx = Context({
                        'user':user,
                        'chat_info':chat_info,
                        'chat_comments':chat_comments
            })
            return render_to_response('chat.html', ctx)

@login_required
def invited_chat(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id = user_id)
    print "invited_chat event"
    try:
        print "try get chatnoti"
        chat_noti = ChatNoti.objects.get(noti_to_user_key = user)
        print "chat_noti get"
        chating_user = chat_noti.noti_from_user_key
        print "chat_noti chating_user get"
        chat_noti.delete()
        print "chat_noti clear"
        chat_info = UserChats.objects.get(chat_to_user_key = user, chat_from_user_key = chating_user)
        chat_comments = ChatComments.objects.filter(userChat_key = chat_info)
        ctx = Context({
                        'user':user,
                        'chat_info':chat_info,
                        'chat_comments':chat_comments
        })
        return render_to_response('chat.html', ctx)
    except:
        return HttpResponse("0")

@csrf_exempt
def chat_comment(request):
    print request.POST.get('room_name')
    print request.POST.get('user_id')
    try:
        user_chat  = UserChats.objects.get(chat_room_name = request.POST.get('room_name'))
        print user_chat.chat_room_name
        user = User.objects.get(id = request.POST.get('user_id'))
        chat_comment = user.username + ": " + request.POST.get('comment')
        ChatComments.objects.create(userChat_key = user_chat, chat_comment = chat_comment)
        print request.POST.get('comment')
        return HttpResponse("Everything worked :)")
    except Exception, e:
        return HttpResponseServerError(str(e))

#class UpdatePost(UpdateView):