FROM python:3

ADD . /usr/src/ingest

WORKDIR /usr/src/ingest

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

ENV DEBUG_OUTPUT 1

# CMD ["python", "twitter.py"]
# CMD ["python", "github.py"]
# CMD ["python", "youtube.py"]
# CMD ["python", "blog.py"]
