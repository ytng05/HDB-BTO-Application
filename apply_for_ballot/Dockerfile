FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apply_for_ballot.py .

EXPOSE 5015

CMD ["python", "apply_for_ballot.py"]
