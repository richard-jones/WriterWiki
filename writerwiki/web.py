import sys, StringIO, json
from flask import Flask, render_template, redirect, url_for, request
from core import WriterWiki
from models import Page
app = Flask(__name__)
app.debug = True
wiki = WriterWiki(sys.argv[1])

# FIXME: jailbreak and unescape required

@app.route("/")
def index():
    return redirect(url_for('page', name="welcome"))

@app.route("/page/<name>", methods=['GET', 'POST'])
def page(name=None):
    if request.method == "GET":
        page = wiki.get_page(name)
        template_names = wiki.get_template_names()
        rm = wiki.get_recently_modified_pages()
        return render_template('page.html', page=page, 
                                templates=template_names, recently_modified=rm)
    elif request.method == "POST":
        page = Page(name, StringIO.StringIO(request.form['content']))
        wiki.update_page(page)
        if request.form.get('commit', False):
            wiki.snapshot()
        return ""

@app.route("/api/page/<name>/works", methods=['GET'])
def page_works(name):
    if request.method == "GET":
        works = wiki.get_works_for_page(name)
        return json.dumps(works)

@app.route("/template/<name>")
def template(name=None):
    raw = False
    if name.endswith(".txt"):
        raw = True
        name = name[:-4]
    template = wiki.get_template(name)
    if raw:
        return template.content.read()
    else:
        return render_template('template.html', template=template)
    
@app.route("/resource/<path>")
def resource(path=None):
    return render_template('resource.html', resource=path)

@app.route("/api/works", methods=['GET'])
@app.route("/api/work/<name>", methods=['GET', 'POST'])
def work(name=None):
    if request.method == "GET":
        if name is None:
            works = wiki.get_work_names()
            return json.dumps(works)
        else:
            pages = wiki.get_work_pages(name)
            return json.dumps(pages)
    elif request.method == "POST":
        page = request.form.get("page")
        wiki.add_to_work(name, page)
        return ""

@app.route("/api/pages", methods=['GET'])
def pages():
    all = wiki.get_all_pages()
    return json.dumps(all)

@app.route("/api/working", methods=['GET'])
@app.route("/api/working/<name>", methods=['POST', 'DELETE'])
def working(name=None):
    if request.method == "POST":
        wiki.add_to_workingset(name)
        return ""
    elif request.method == "GET":
        working = wiki.get_workingset()
        return json.dumps(working)
    elif request.method == "DELETE":
        wiki.remove_from_workingset(name)
        return ""

@app.route("/api/tags", methods=['GET'])
@app.route("/api/tags/<page>", methods=['GET', 'POST'])
def tags(page=None):
    if request.method == "GET":
        if page is not None:
            ts = wiki.get_tags(page)
            return json.dumps(ts)
        else:
            ts = wiki.get_tag_cloud()
            return json.dumps(ts)
    elif request.method == "POST":
        ts = request.form.get("tags")
        ta = [t.strip() for t in ts.split(",")]
        wiki.set_tags(page, ta)
        return ""

@app.route("/api/tag/<tag>", methods=["GET"])
def tagged(tag):
    if request.method == "GET":
        pages = wiki.get_tagged_pages(tag)
        return json.dumps(pages)
    return ""

if __name__ == "__main__":
    app.run()