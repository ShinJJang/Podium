# -*- coding: utf-8 -*-
import requests
from .models import Groups, Posts, Memberships
from celery.schedules import crontab
from celery.task import periodic_task
import json
from datetime import datetime


# this will run every day at 06:00 that everybody maybe sleep,
# see http://celeryproject.org/docs/reference/celery.task.schedules.html#celery.task.schedules.crontab
@periodic_task(run_every=crontab(minute=0, hour=6))
def polling_repo_commit_log():

    groups = Groups.objects.all()
    for group in groups:
        if group.github_repo is not None and group.github_repo != "":

            group_owner = Memberships.objects.filter(group_key=group, permission=2)
            if not group_owner.exists():
                continue
            else:
                group_owner = group_owner[0].user_key

            response = requests.get("https://api.github.com/repos/"+group.github_repo+"/events?access_token=5d8f3b01b598b741b0dd601fdbb8a80537db523a")
            if response.status_code != 200:
                continue

            events = json.loads(response._content)
            if events.__len__ == 0:
                continue

            last_id = group.github_commit_last_id

            for obj in events[::-1]:
                if obj['type'] == "PushEvent" and ((group.github_commit_last_id is not None and obj['id'] > group.github_commit_last_id) or group.github_commit_last_id is None or group.github_commit_last_id == ""):
                    commits = obj['payload']['commits']
                    last_id = obj['id']
                    push_time = datetime.strptime(str(obj['created_at']).replace("T", " ").replace("Z", ""), "%Y-%m-%d %H:%M:%S").strftime("%Y. %m. %d. %p %I:%M:%S")
                    for commit in commits:
                        commit_massage = commit['message']
                        commit_autor = commit['author']['name']
                        commit_url = "https://github.com/"+group.github_repo+"/commit/"+commit['sha']
                        commit_log = "Repository : "+group.github_repo+"\nCommitor : "+commit_autor+\
                                     "\nCommit Message : "+commit_massage+"\npush_time : "+push_time+"\ncommit url : "+commit_url+"\n\n Auto-generated by Podium"
                        obj = Posts(user_key=group_owner, post=commit_log, open_scope=3, group=group)
                        obj.save()
                else:
                    break

            if group.github_commit_last_id < last_id:
                group.github_commit_last_id = last_id
                group.save()

            print group.group_name+" commit log updated!"